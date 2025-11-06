import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Language, TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  authService = inject(AuthService);
  translationService = inject(TranslationService);
  sidebarOpen = signal(true);
  languageDropdownOpen = signal(false);

  user = this.authService.currentUser;
  currentLanguage = this.translationService.currentLanguage;
  
  isAdmin = computed(() => this.user()?.role === 'admin');

  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }

  toggleLanguageDropdown() {
    this.languageDropdownOpen.update(open => !open);
  }

  setLanguage(lang: Language) {
    this.translationService.setLanguage(lang);
    this.languageDropdownOpen.set(false);
  }

  logout() {
    this.authService.logout().subscribe();
  }
}
