import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './services/translation.service';
import { NotificationsComponent } from './components/shared/notifications/notifications.component';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-notifications></app-notifications>
  `,
  styles: ``,
  imports: [RouterOutlet, NotificationsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Inject the service here to ensure it's initialized when the app starts.
  constructor() {
    inject(TranslationService);
  }
}
