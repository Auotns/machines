import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationType } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      @for (notification of notificationService.getNotifications()(); track notification.id) {
        <div
          [class]="getNotificationClasses(notification.type)"
          class="p-4 rounded-lg shadow-lg flex items-start justify-between animate-slide-in"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0 mr-3">
              @switch (notification.type) {
                @case ('success') {
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                }
                @case ('error') {
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                }
                @case ('warning') {
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                }
                @case ('info') {
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                }
              }
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium">{{ notification.message }}</p>
            </div>
          </div>
          <button
            (click)="notificationService.remove(notification.id)"
            class="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);

  getNotificationClasses(type: NotificationType): string {
    const baseClasses = 'border-l-4';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-500`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-500`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-500`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-500`;
    }
  }
}
