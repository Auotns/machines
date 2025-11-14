import { Injectable } from '@angular/core';

/**
 * Input Sanitization Service
 * Protects against XSS and injection attacks by sanitizing user inputs
 */
@Injectable({
  providedIn: 'root',
})
export class SanitizerService {
  
  /**
   * Sanitize plain text input
   * Removes/escapes potentially dangerous characters
   */
  sanitizeText(input: string): string {
    if (!input) return '';
    
    return input
      .trim()
      // Remove null bytes
      .replace(/\0/g, '')
      // Limit to reasonable length
      .slice(0, 10000);
  }

  /**
   * Sanitize HTML content (for rich text fields)
   * Strips all HTML tags except safe ones
   */
  sanitizeHtml(input: string): string {
    if (!input) return '';
    
    // For now, strip ALL HTML tags
    // In future, could use DOMPurify or allow safe tags
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim()
      .slice(0, 10000);
  }

  /**
   * Sanitize email address
   */
  sanitizeEmail(email: string): string {
    if (!email) return '';
    
    const trimmed = email.trim().toLowerCase();
    
    // Basic email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(trimmed)) {
      throw new Error('Invalid email format');
    }
    
    return trimmed;
  }

  /**
   * Sanitize file name
   * Removes path traversal attempts and dangerous characters
   */
  sanitizeFileName(fileName: string): string {
    if (!fileName) return '';
    
    return fileName
      .trim()
      // Remove path separators
      .replace(/[\/\\]/g, '')
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove potentially dangerous characters
      .replace(/[<>:"|?*]/g, '')
      // Limit length
      .slice(0, 255);
  }

  /**
   * Sanitize numeric input
   */
  sanitizeNumber(input: any): number {
    const num = parseFloat(input);
    
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Invalid number');
    }
    
    return num;
  }

  /**
   * Sanitize integer input
   */
  sanitizeInteger(input: any): number {
    const num = parseInt(input, 10);
    
    if (isNaN(num) || !isFinite(num)) {
      throw new Error('Invalid integer');
    }
    
    return num;
  }

  /**
   * Sanitize URL
   */
  sanitizeUrl(url: string): string {
    if (!url) return '';
    
    const trimmed = url.trim();
    
    // Only allow http(s) protocols
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      throw new Error('URL must start with http:// or https://');
    }
    
    // Prevent javascript: and data: URLs
    if (trimmed.toLowerCase().startsWith('javascript:') || 
        trimmed.toLowerCase().startsWith('data:')) {
      throw new Error('Invalid URL protocol');
    }
    
    return trimmed.slice(0, 2048);
  }

  /**
   * Sanitize device/part name
   * Allows alphanumeric, spaces, and common punctuation
   */
  sanitizeName(name: string): string {
    if (!name) return '';
    
    return name
      .trim()
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Allow letters, numbers, spaces, and common punctuation
      .replace(/[^a-zA-Z0-9\s\-\_\.\,\(\)]/g, '')
      .slice(0, 255);
  }

  /**
   * Sanitize notes/description field
   */
  sanitizeNotes(notes: string): string {
    if (!notes) return '';
    
    return notes
      .trim()
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .slice(0, 5000); // 5000 chars max for notes
  }

  /**
   * Sanitize SKU/ID
   * Alphanumeric and hyphens only
   */
  sanitizeSku(sku: string): string {
    if (!sku) return '';
    
    return sku
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\-]/g, '')
      .slice(0, 100);
  }

  /**
   * Sanitize specification key-value pairs
   */
  sanitizeSpecifications(specs: Record<string, string | number>): Record<string, string | number> {
    const sanitized: Record<string, string | number> = {};
    
    for (const [key, value] of Object.entries(specs)) {
      // Sanitize key
      const sanitizedKey = this.sanitizeName(key).slice(0, 100);
      
      if (!sanitizedKey) continue;
      
      // Sanitize value based on type
      if (typeof value === 'number') {
        sanitized[sanitizedKey] = this.sanitizeNumber(value);
      } else {
        sanitized[sanitizedKey] = this.sanitizeText(String(value)).slice(0, 500);
      }
    }
    
    // Limit number of specifications
    const keys = Object.keys(sanitized).slice(0, 50);
    const limited: Record<string, string | number> = {};
    
    for (const key of keys) {
      limited[key] = sanitized[key];
    }
    
    return limited;
  }

  /**
   * Validate and sanitize date string
   */
  sanitizeDate(dateStr: string): string {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    
    // Return ISO date format YYYY-MM-DD
    return date.toISOString().split('T')[0];
  }

  /**
   * Sanitize device status
   */
  sanitizeDeviceStatus(status: string): 'operational' | 'maintenance' | 'offline' {
    const normalized = status?.toLowerCase().trim();
    
    if (normalized === 'operational' || normalized === 'maintenance' || normalized === 'offline') {
      return normalized;
    }
    
    throw new Error('Invalid device status');
  }

  /**
   * Sanitize maintenance type
   */
  sanitizeMaintenanceType(type: string): 'scheduled' | 'emergency' {
    const normalized = type?.toLowerCase().trim();
    
    if (normalized === 'scheduled' || normalized === 'emergency') {
      return normalized;
    }
    
    throw new Error('Invalid maintenance type');
  }
}
