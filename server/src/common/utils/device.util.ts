import { Request } from 'express';

export interface DeviceInfo {
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  platform: string;
  browser: string;
  userAgent: string;
  ipAddress: string;
}

export class DeviceUtil {
  static extractDeviceInfo(req: Request): DeviceInfo {
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = this.getClientIP(req);
    
    return {
      deviceName: this.getDeviceName(userAgent),
      deviceType: this.getDeviceType(userAgent),
      platform: this.getPlatform(userAgent),
      browser: this.getBrowser(userAgent),
      userAgent,
      ipAddress
    };
  }

  private static getClientIP(req: Request): string {
    const xForwardedFor = req.headers['x-forwarded-for'] as string;
    const xRealIP = req.headers['x-real-ip'] as string;
    
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    
    if (xRealIP) {
      return xRealIP;
    }
    
    return req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           (req.connection as any).socket?.remoteAddress || 
           'unknown';
  }

  private static getDeviceName(userAgent: string): string {
    // Try to extract device name from user agent
    if (userAgent.includes('iPhone')) {
      return 'iPhone';
    } else if (userAgent.includes('iPad')) {
      return 'iPad';
    } else if (userAgent.includes('Android')) {
      const androidMatch = userAgent.match(/Android\s+([\d.]+)/);
      const deviceMatch = userAgent.match(/; ([^)]+)\)/);
      if (deviceMatch && deviceMatch[1]) {
        return deviceMatch[1].trim();
      }
      return 'Android Device';
    } else if (userAgent.includes('Windows')) {
      const windowsMatch = userAgent.match(/Windows\s+NT\s+([\d.]+)/);
      if (windowsMatch) {
        return `Windows ${windowsMatch[1]}`;
      }
      return 'Windows PC';
    } else if (userAgent.includes('Macintosh')) {
      return 'Mac';
    } else if (userAgent.includes('Linux')) {
      return 'Linux PC';
    }
    
    return 'Unknown Device';
  }

  private static getDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    // Mobile indicators
    const mobileIndicators = [
      'Mobile', 'Android', 'iPhone', 'Windows Phone',
      'BlackBerry', 'Opera Mini', 'IEMobile'
    ];
    
    // Tablet indicators
    const tabletIndicators = [
      'iPad', 'Tablet', 'Kindle', 'Nexus 7', 'Nexus 9',
      'Nexus 10', 'SM-T', 'SM-P'
    ];
    
    // Check for tablet first (some tablets also have mobile indicators)
    for (const indicator of tabletIndicators) {
      if (userAgent.includes(indicator)) {
        return 'tablet';
      }
    }
    
    // Check for mobile
    for (const indicator of mobileIndicators) {
      if (userAgent.includes(indicator)) {
        return 'mobile';
      }
    }
    
    return 'desktop';
  }

  private static getPlatform(userAgent: string): string {
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return 'iOS';
    } else if (userAgent.includes('Android')) {
      return 'Android';
    } else if (userAgent.includes('Windows')) {
      return 'Windows';
    } else if (userAgent.includes('Macintosh')) {
      return 'macOS';
    } else if (userAgent.includes('Linux')) {
      return 'Linux';
    }
    
    return 'Unknown';
  }

  private static getBrowser(userAgent: string): string {
    // Check for various browsers
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
      return chromeMatch ? `Chrome ${chromeMatch[1]}` : 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const safariMatch = userAgent.match(/Version\/([\d.]+).*Safari/);
      return safariMatch ? `Safari ${safariMatch[1]}` : 'Safari';
    } else if (userAgent.includes('Firefox')) {
      const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/);
      return firefoxMatch ? `Firefox ${firefoxMatch[1]}` : 'Firefox';
    } else if (userAgent.includes('Edg')) {
      const edgeMatch = userAgent.match(/Edg\/([\d.]+)/);
      return edgeMatch ? `Edge ${edgeMatch[1]}` : 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      const operaMatch = userAgent.match(/(Opera|OPR)\/([\d.]+)/);
      return operaMatch ? `Opera ${operaMatch[2]}` : 'Opera';
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      return 'Internet Explorer';
    }
    
    return 'Unknown Browser';
  }

  static isTrustedDevice(userAgent: string, knownDevices: string[]): boolean {
    return knownDevices.some(knownUserAgent => 
      this.getBrowser(userAgent) === this.getBrowser(knownUserAgent) &&
      this.getPlatform(userAgent) === this.getPlatform(knownUserAgent) &&
      this.getDeviceType(userAgent) === this.getDeviceType(knownUserAgent)
    );
  }
}
