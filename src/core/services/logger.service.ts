import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Centralized Logger Service
 * Only logs in development mode to prevent sensitive data exposure in production
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  
  log(...args: any[]): void {
    if (environment.enableLogging) {
      console.log(...args);
    }
  }

  info(...args: any[]): void {
    if (environment.enableLogging) {
      console.info(...args);
    }
  }

  warn(...args: any[]): void {
    if (environment.enableLogging) {
      console.warn(...args);
    }
  }

  error(...args: any[]): void {
    // Always log errors (but sanitize sensitive data in production)
    if (environment.production) {
      // In production, log sanitized version
      const sanitized = args.map(arg => this.sanitizeForProduction(arg));
      console.error(...sanitized);
    } else {
      console.error(...args);
    }
  }

  debug(...args: any[]): void {
    if (environment.enableLogging) {
      console.debug(...args);
    }
  }

  /**
   * Sanitize sensitive data for production logging
   */
  private sanitizeForProduction(data: any): any {
    if (typeof data === 'string') {
      // Remove email addresses
      return data.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {};
      
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          // Redact sensitive fields
          if (['password', 'token', 'secret', 'key', 'email', 'user'].some(s => key.toLowerCase().includes(s))) {
            sanitized[key] = '[REDACTED]';
          } else {
            sanitized[key] = this.sanitizeForProduction(data[key]);
          }
        }
      }
      
      return sanitized;
    }
    
    return data;
  }
}
