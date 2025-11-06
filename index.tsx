

import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { AppComponent } from './src/app.component';
import { APP_ROUTES } from './src/app.routes';
import { authInterceptor } from './src/core/interceptors/auth.interceptor';
import { errorInterceptor } from './src/core/interceptors/error.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    // Použiť zone.js pre automatic change detection
    provideRouter(APP_ROUTES, withHashLocation()),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
