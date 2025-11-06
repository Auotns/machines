import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Získať token z localStorage
  const token = localStorage.getItem(environment.jwtTokenKey);
  
  // Klonovať request a pridať Authorization header
  let authReq = req;
  if (token && !req.url.includes('/auth/login')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Pridať base URL ak je relatívna
  if (!authReq.url.startsWith('http')) {
    authReq = authReq.clone({
      url: `${environment.apiUrl}${authReq.url}`
    });
  }
  
  if (environment.enableLogging) {
    console.log('[HTTP Request]', authReq.method, authReq.url);
  }
  
  return next(authReq).pipe(
    catchError((error) => {
      if (environment.enableLogging) {
        console.error('[HTTP Error]', error);
      }
      
      // Ak je 401 Unauthorized, presmerovať na login
      if (error.status === 401) {
        localStorage.removeItem(environment.jwtTokenKey);
        localStorage.removeItem(environment.refreshTokenKey);
        router.navigateByUrl('/login');
      }
      
      return throwError(() => error);
    })
  );
};
