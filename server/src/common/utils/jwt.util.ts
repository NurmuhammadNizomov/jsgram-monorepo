import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

export interface JwtPayload {
  userId: string;
  deviceId: string;
  sessionId: string;
  type: 'access' | 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export class JwtUtil {
  private static get ACCESS_TOKEN_EXPIRES_IN() { return process.env.JWT_ACCESS_EXPIRES_IN || '15m'; }
  private static get REFRESH_TOKEN_EXPIRES_IN() { return process.env.JWT_REFRESH_EXPIRES_IN || '7d'; }
  private static get ACCESS_SECRET() { return process.env.JWT_ACCESS_SECRET || 'fallback-access-secret'; }
  private static get REFRESH_SECRET() { return process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'; }

  static generateTokenPair(userId: string, deviceId: string): TokenPair {
    const sessionId = crypto.randomUUID();
    
    const accessTokenPayload: JwtPayload = {
      userId,
      deviceId,
      sessionId,
      type: 'access'
    };

    const refreshTokenPayload: JwtPayload = {
      userId,
      deviceId,
      sessionId,
      type: 'refresh'
    };

    const accessToken = jwt.sign(accessTokenPayload, this.ACCESS_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'jsgram',
      audience: 'jsgram-users'
    });

    const refreshToken = jwt.sign(refreshTokenPayload, this.REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'jsgram',
      audience: 'jsgram-users'
    });

    return {
      accessToken,
      refreshToken,
      sessionId
    };
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_SECRET, {
        issuer: 'jsgram',
        audience: 'jsgram-users'
      }) as JwtPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_SECRET, {
        issuer: 'jsgram',
        audience: 'jsgram-users'
      }) as JwtPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static refreshAccessToken(refreshToken: string): string {
    const decoded = this.verifyRefreshToken(refreshToken);
    
    const accessTokenPayload: JwtPayload = {
      userId: decoded.userId,
      deviceId: decoded.deviceId,
      sessionId: decoded.sessionId,
      type: 'access'
    };

    return jwt.sign(accessTokenPayload, this.ACCESS_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
      issuer: 'jsgram',
      audience: 'jsgram-users'
    });
  }

  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static extractTokenFromBearer(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      return true;
    }
    return expiration < new Date();
  }
}
