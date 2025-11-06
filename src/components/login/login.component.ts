import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);

  loginAs(role: 'admin' | 'technician') {
    console.log('=== LOGIN STARTED ===');
    console.log('Role:', role);
    
    // Použiť predvolené heslo pre demo účely
    const password = 'password123';
    
    console.log('Calling authService.login()...');
    const loginObservable = this.authService.login(role, password);
    console.log('Observable created:', loginObservable);
    
    console.log('Subscribing to login observable...');
    loginObservable.subscribe({
      next: (success) => {
        console.log('Login observable NEXT called, success:', success);
        if (success) {
          this.notificationService.success(`Úspešne prihlásený ako ${role}`);
        } else {
          this.notificationService.error('Prihlásenie zlyhalo. Skontrolujte či existuje používateľ v Supabase.');
        }
      },
      error: (error) => {
        console.error('Login observable ERROR called:', error);
        this.notificationService.error('Chyba pri prihlasovaní. Skontrolujte konzolu a Supabase nastavenia.');
      },
      complete: () => {
        console.log('Login observable COMPLETE called');
      }
    });
  }
}
