import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private defaultDuration = 5000; // 5 sekúnd

  /**
   * Získať všetky aktívne notifikácie
   */
  getNotifications() {
    return this.notifications.asReadonly();
  }

  /**
   * Zobraziť success notifikáciu
   */
  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  /**
   * Zobraziť error notifikáciu
   */
  error(message: string, duration?: number): void {
    this.show('error', message, duration);
  }

  /**
   * Zobraziť warning notifikáciu
   */
  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  /**
   * Zobraziť info notifikáciu
   */
  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  /**
   * Zobraziť notifikáciu
   */
  private show(type: NotificationType, message: string, duration?: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      duration: duration || this.defaultDuration,
      timestamp: new Date(),
    };

    this.notifications.update(notifications => [...notifications, notification]);

    // Automaticky odstrániť notifikáciu po určitom čase
    const notificationDuration = notification.duration || this.defaultDuration;
    if (notificationDuration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, notificationDuration);
    }
  }

  /**
   * Odstrániť notifikáciu podľa ID
   */
  remove(id: string): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== id)
    );
  }

  /**
   * Vymazať všetky notifikácie
   */
  clear(): void {
    this.notifications.set([]);
  }

  /**
   * Vygenerovať unikátne ID
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Spracovať HTTP error a zobraziť notifikáciu
   */
  handleError(error: any): void {
    let message = 'Nastala neočakávaná chyba';

    if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    this.error(message);
  }
}
