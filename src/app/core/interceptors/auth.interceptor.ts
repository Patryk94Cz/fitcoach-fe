import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.headers.has('Skip-Token-Injection')) {
    const newReq = req.clone({
      headers: req.headers.delete('Skip-Token-Injection')
    });
    return next(newReq);
  }

  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token) {
        if (!req.url.includes('/auth/refresh-token') && !req.url.includes('/auth/login')) {

          if (authService.isTokenExpired(token)) {
            console.log('Token expired, attempting refresh...');

            return authService.refreshAccessToken().pipe(
              switchMap(() => {
                const newToken = authService.getToken();
                const retryReq = req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                });
                return next(retryReq);
              }),
              catchError((refreshError) => {
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
