import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtUtil } from '../../common/utils/jwt.util';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId -> Set of socketIds (one user can have multiple tabs)
  private onlineUsers = new Map<string, Set<string>>();

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;
      if (!token) return client.disconnect();

      const payload = JwtUtil.verifyAccessToken(token);
      const userId = payload.userId;

      // Store userId on socket instance
      (client as any).userId = userId;

      // Track online
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(client.id);

      await this.chatService.markOnline(userId);

      // Notify others
      client.broadcast.emit('user_online', { userId });
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId as string | undefined;
    if (!userId) return;

    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(userId);
        await this.chatService.markOffline(userId);
        this.server.emit('user_offline', { userId, lastSeen: new Date() });
      }
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.join(conversationId);
    return { event: 'joined', data: conversationId };
  }

  @SubscribeMessage('leave_conversation')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.leave(conversationId);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; text: string },
  ) {
    const userId = (client as any).userId as string;
    if (!userId || !payload.conversationId || !payload.text?.trim()) return;

    try {
      const message = await this.chatService.saveMessage(
        payload.conversationId,
        userId,
        payload.text.trim(),
      );

      // Emit to everyone in the room (including sender)
      this.server.to(payload.conversationId).emit('new_message', message);
    } catch {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string; isTyping: boolean },
  ) {
    const userId = (client as any).userId as string;
    if (!userId) return;

    client.to(payload.conversationId).emit('typing', {
      userId,
      conversationId: payload.conversationId,
      isTyping: payload.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    const userId = (client as any).userId as string;
    if (!userId) return;

    // Notify others in room that messages are read
    client.to(payload.conversationId).emit('messages_read', {
      conversationId: payload.conversationId,
      userId,
    });
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
