import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, from } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Authentication Interceptor
 * - Automatically adds Bearer token to requests
 * - Checks token expiration and refreshes if needed
 * - Handles 401 errors and redirects to login
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Skip auth for login endpoints
  if (req.url.includes('/auth/login') || req.url.includes('/auth/token')) {
    return next(req);
  }
  
  // Get and validate token
  const tokenData = getValidToken();
  
  if (!tokenData) {
    // No valid token - let request proceed (might be public endpoint)
    return next(addBaseUrl(req));
  }
  
  // Check if token is about to expire (within 5 minutes)
  const isExpiringSoon = tokenData.expiresAt && 
    (tokenData.expiresAt * 1000 < Date.now() + 5 * 60 * 1000);
  
  if (isExpiringSoon && tokenData.refreshToken) {
    // Attempt silent refresh before making the request
    return from(refreshAccessToken(tokenData.refreshToken)).pipe(
      switchMap(newToken => {
        if (newToken) {
          // Retry request with new token
          const authReq = addAuthHeader(addBaseUrl(req), newToken);
          return next(authReq);
        } else {
          // Refresh failed, proceed with old token (will likely get 401)
          const authReq = addAuthHeader(addBaseUrl(req), tokenData.accessToken);
          return next(authReq);
        }
      }),
      catchError(error => {
        // Refresh failed, clear tokens and redirect
        clearAuthData(router);
        return throwError(() => error);
      })
    );
  }
  
  // Token is valid, add to request
  const authReq = addAuthHeader(addBaseUrl(req), tokenData.accessToken);
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (environment.enableLogging) {
        console.error('[HTTP Error]', error.status, error.message);
      }
      
      // Handle 401 Unauthorized
      if (error.status === 401) {
        clearAuthData(router);
      }
      
      return throwError(() => error);
    })
  );
};

/**
 * Get valid token from localStorage
 * Returns null if token is missing or expired
 */
function getValidToken(): { accessToken: string; refreshToken: string; expiresAt: number } | null {
  const tokenStr = localStorage.getItem('supabase.auth.token');
  if (!tokenStr) return null;
  
  try {
    const tokenData = JSON.parse(tokenStr);
    const expiresAt = tokenData.expires_at;
    
    // Check if token is already expired (with 1 minute buffer)
    if (expiresAt && expiresAt * 1000 < Date.now() + 60000) {
      if (environment.enableLogging) {
        console.warn('⚠️ Token expired, attempting refresh...');
      }
      return null;
    }
    
    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at
    };
  } catch (e) {
    console.error('❌ Error parsing token:', e);
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${environment.supabase.url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': environment.supabase.anonKey,
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Store new tokens
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    }));
    
    if (environment.enableLogging) {
      console.log('✅ Token refreshed successfully');
    }
    
    return data.access_token;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return null;
  }
}

/**
 * Add Authorization header to request
 */
function addAuthHeader(req: any, token: string) {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Add base URL to relative requests
 */
function addBaseUrl(req: any) {
  if (!req.url.startsWith('http')) {
    return req.clone({
      url: `${environment.apiUrl}${req.url}`
    });
  }
  return req;
}

/**
 * Clear authentication data and redirect to login
 */
function clearAuthData(router: Router): void {
  if (environment.enableLogging) {
    console.log('🧹 Clearing auth data and redirecting to login');
  }
  localStorage.removeItem(environment.jwtTokenKey);
  localStorage.removeItem(environment.refreshTokenKey);
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('currentUser');
  router.navigateByUrl('/login');
}
