// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip token injection for specific requests
  if (req.headers.has('Skip-Token-Injection')) {
    // Remove the skip header and proceed without token
    const newReq = req.clone({
      headers: req.headers.delete('Skip-Token-Injection')
    });
    return next(newReq);
  }

  const token = authService.getToken();

  // Add authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors (Unauthorized)
      if (error.status === 401 && token) {
        // Check if this is not already a refresh token request
        if (!req.url.includes('/auth/refresh-token') && !req.url.includes('/auth/login')) {

          // Check if token is expired
          if (authService.isTokenExpired(token)) {
            console.log('Token expired, attempting refresh...');

            // Attempt to refresh the token
            return authService.refreshAccessToken().pipe(
              switchMap(() => {
                // Retry the original request with new token
                const newToken = authService.getToken();
                const retryReq = req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                });
                return next(retryReq);
              }),
              catchError((refreshError) => {
                // If refresh fails, logout and throw error
                console.error('Token refresh failed:', refreshError);
                authService.logout();
                return throwError(() => refreshError);
              })
            );
          }
        }
      }

      return throwError(() => error);
    })
  );
};
