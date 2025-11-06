import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiError {
  status: number;
  message: string;
  error?: any;
  timestamp: string;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    timeout(environment.apiTimeout),
    catchError((error) => {
      const apiError: ApiError = {
        status: error.status || 0,
        message: getErrorMessage(error),
        error: error.error,
        timestamp: new Date().toISOString(),
      };
      
      if (environment.enableLogging) {
        console.error('[API Error]', apiError);
      }
      
      // Tu by sme mohli poslať error do externého loggingu (napr. Sentry)
      
      return throwError(() => apiError);
    })
  );
};

function getErrorMessage(error: any): string {
  if (error.error?.message) {
    return error.error.message;
  }
  
  switch (error.status) {
    case 0:
      return 'Nie je možné sa pripojiť k serveru. Skontrolujte pripojenie k internetu.';
    case 400:
      return 'Neplatná požiadavka.';
    case 401:
      return 'Neautorizovaný prístup. Prosím prihláste sa znova.';
    case 403:
      return 'Nemáte oprávnenie na túto operáciu.';
    case 404:
      return 'Zdroj nebol nájdený.';
    case 500:
      return 'Chyba servera. Skúste to prosím neskôr.';
    case 503:
      return 'Server je dočasne nedostupný.';
    default:
      return error.message || 'Nastala neočakávaná chyba.';
  }
}
