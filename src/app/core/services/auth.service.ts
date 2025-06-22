// src/app/core/services/auth.service.ts
import {Injectable, PLATFORM_ID, inject} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, catchError, finalize, map, of, tap, timer, switchMap, share} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';
import {environment} from '../../../environments/environment';
import {LoginRequest} from '../../models/auth/login-request.model';
import {RegisterRequest} from '../../models/auth/register-request.model';
import {JwtResponse} from '../../models/auth/jwt-response.model';
import {User} from '../../models/user.model';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private accessTokenKey = 'fitcoach_access_token';
  private refreshTokenKey = 'fitcoach_refresh_token';
  private tokenExpiryKey = 'fitcoach_token_expiry';
  private userDataKey = 'fitcoach_user_data';
  private platformId = inject(PLATFORM_ID);

  // Refresh token management
  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private tokenRefreshTimer: any = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
    this.setupTokenRefreshTimer();
  }

  private loadStoredUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      const accessToken = localStorage.getItem(this.accessTokenKey);
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      const userData = localStorage.getItem(this.userDataKey);

      if (accessToken && refreshToken && userData) {
        try {
          const user = JSON.parse(userData);

          if (this.isTokenExpired(accessToken)) {
            console.log('Access token expired, attempting refresh...');
            this.refreshAccessToken().subscribe({
              next: () => {
                this.currentUserSubject.next(user);
                this.isAuthenticatedSubject.next(true);
              },
              error: () => {
                this.clearTokens();
              }
            });
          } else {
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
            this.setupTokenRefreshTimer();
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          this.clearTokens();
        }
      }
    }
  }

  /**
   * Authenticates user with credentials
   * @param loginRequest User login credentials
   * @returns Observable containing auth response with JWT token
   */
  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    this.isLoadingSubject.next(true);

    return this.http.post<JwtResponse>(`${environment.apiUrl}/auth/login`, loginRequest)
      .pipe(
        tap(response => this.handleAuth(response)),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        }),
        finalize(() => {
          this.isLoadingSubject.next(false);
        })
      );
  }

  /**
   * Registers a new user
   * @param registerRequest User registration data
   * @returns Observable with registration response
   */
  register(registerRequest: RegisterRequest): Observable<any> {
    this.isLoadingSubject.next(true);

    const headers = new HttpHeaders({
      'Accept': 'application/json, text/plain, */*',
      'Skip-Token-Injection': 'true'
    });

    return this.http.post(`${environment.apiUrl}/auth/register`, registerRequest, {
      headers,
      responseType: 'text'
    }).pipe(
      map(response => {
        try {
          return JSON.parse(response);
        } catch (e) {
          return {message: response};
        }
      }),
      catchError(error => {
        console.error('Registration error:', error);
        throw error;
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
      })
    );
  }

  /**
   * Refreshes the access token using refresh token
   * @returns Observable with new access token
   */
  refreshAccessToken(): Observable<JwtResponse> {
    if (this.refreshTokenInProgress) {
      // If refresh is in progress, wait for it to complete
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            // Return a mock response when refresh completes
            return of({
              accessToken: token,
              refreshToken: this.getRefreshToken(),
              type: 'Bearer',
              id: this.currentUserSubject.value?.id || 0,
              username: this.currentUserSubject.value?.username || '',
              email: this.currentUserSubject.value?.email || '',
              role: this.currentUserSubject.value?.role || '',
              expiresIn: 900
            } as JwtResponse);
          }
          throw new Error('Token refresh failed');
        })
      );
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token available');
    }

    this.refreshTokenInProgress = true;
    this.refreshTokenSubject.next(null);

    const headers = new HttpHeaders({
      'Skip-Token-Injection': 'true'
    });

    return this.http.post<JwtResponse>(`${environment.apiUrl}/auth/refresh-token`, {
      refreshToken: refreshToken
    }, { headers }).pipe(
      tap(response => {
        this.refreshTokenInProgress = false;
        this.handleAuth(response);
        this.refreshTokenSubject.next(response.accessToken);
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.next(null);
        this.logout();
        throw error;
      }),
      share()
    );
  }

  /**
   * Gets current authenticated user profile
   * @returns Observable with user data
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.storeUserData(user);
        }),
        catchError(error => {
          if (error.status === 401) {
            // Try to refresh token
            return this.refreshAccessToken().pipe(
              switchMap(() => this.http.get<User>(`${environment.apiUrl}/users/me`)),
              tap(user => {
                this.currentUserSubject.next(user);
                this.storeUserData(user);
              }),
              catchError(() => {
                this.logout();
                throw error;
              })
            );
          }
          throw error;
        })
      );
  }

  /**
   * Logs out the current user
   * Clears tokens from storage and resets authentication state
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      // Call logout endpoint to invalidate refresh token
      const headers = new HttpHeaders({
        'Skip-Token-Injection': 'true'
      });

      this.http.post(`${environment.apiUrl}/auth/logout`, {
        refreshToken: refreshToken
      }, { headers }).subscribe({
        next: () => console.log('Logout successful on server'),
        error: (error) => console.error('Logout error on server:', error)
      });
    }

    this.clearTokens();
    this.clearRefreshTimer();
    this.router.navigate(['/login']);
  }

  /**
   * Handles successful authentication
   * @param authResponse Response from authentication API
   */
  private handleAuth(authResponse: JwtResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      // Store tokens
      localStorage.setItem(this.accessTokenKey, authResponse.accessToken);
      localStorage.setItem(this.refreshTokenKey, authResponse.refreshToken);

      // Calculate and store expiry time
      const expiryTime = new Date().getTime() + (authResponse.expiresIn * 1000);
      localStorage.setItem(this.tokenExpiryKey, expiryTime.toString());
    }

    const user: User = {
      id: authResponse.id,
      username: authResponse.username,
      email: authResponse.email,
      role: authResponse.role
    };

    this.storeUserData(user);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.setupTokenRefreshTimer();
  }

  /**
   * Stores user data in localStorage
   * @param user User data to store
   */
  private storeUserData(user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userDataKey, JSON.stringify(user));
    }
  }

  /**
   * Clears all stored tokens and user data
   */
  private clearTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.accessTokenKey);
      localStorage.removeItem(this.refreshTokenKey);
      localStorage.removeItem(this.tokenExpiryKey);
      localStorage.removeItem(this.userDataKey);
    }

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Gets the stored access token
   * @returns String token or null if not found
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.accessTokenKey);
    }
    return null;
  }

  /**
   * Gets the stored refresh token
   * @returns String refresh token or null if not found
   */
  private getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  /**
   * Checks if user is authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!token || !refreshToken) return false;

    // If access token is expired but we have refresh token, we're still considered authenticated
    // The interceptor will handle the refresh
    return true;
  }

  /**
   * Checks if the access token is expired
   * @param token JWT token string (optional, uses stored token if not provided)
   * @returns Boolean indicating if token is expired
   */
  isTokenExpired(token?: string | null): boolean {
    if (!token) {
      token = this.getToken();
    }

    if (!token) return true;

    // Check stored expiry time first (more reliable)
    if (isPlatformBrowser(this.platformId)) {
      const storedExpiry = localStorage.getItem(this.tokenExpiryKey);
      if (storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        return Date.now() >= expiryTime;
      }
    }

    // Fallback to JWT parsing
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return true;

      const payload = JSON.parse(atob(tokenParts[1]));
      if (!payload.exp) return false;

      const expiryTimeMs = payload.exp * 1000;
      return Date.now() >= expiryTimeMs;
    } catch (e) {
      console.error('Error parsing JWT token', e);
      return true;
    }
  }

  /**
   * Sets up automatic token refresh timer
   * Refreshes token 2 minutes before expiry
   */
  private setupTokenRefreshTimer(): void {
    this.clearRefreshTimer();

    const token = this.getToken();
    if (!token || this.isTokenExpired(token)) return;

    let timeUntilRefresh: number;

    // Try to get expiry from stored value first
    if (isPlatformBrowser(this.platformId)) {
      const storedExpiry = localStorage.getItem(this.tokenExpiryKey);
      if (storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        timeUntilRefresh = expiryTime - Date.now() - (2 * 60 * 1000); // 2 minutes before expiry
      } else {
        // Fallback to JWT parsing
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp) {
            const expiryTime = payload.exp * 1000;
            timeUntilRefresh = expiryTime - Date.now() - (2 * 60 * 1000);
          } else {
            return;
          }
        } catch (e) {
          return;
        }
      }
    } else {
      return;
    }

    if (timeUntilRefresh > 0) {
      this.tokenRefreshTimer = timer(timeUntilRefresh).subscribe(() => {
        console.log('Auto-refreshing access token...');
        this.refreshAccessToken().subscribe({
          next: () => console.log('Token auto-refresh successful'),
          error: (error) => console.error('Token auto-refresh failed:', error)
        });
      });
    }
  }

  /**
   * Clears the token refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      this.tokenRefreshTimer.unsubscribe();
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Health check to verify connectivity with backend
   * @returns Observable<boolean> indicating if backend is reachable
   */
  checkBackendHealth(): Observable<boolean> {
    const headers = new HttpHeaders().set('Skip-Token-Injection', 'true');

    return this.http.get<any>(`${environment.apiUrl}/public/health`, {headers})
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  /**
   * Forgot password functionality
   * @param email User email
   * @returns Observable with response
   */
  forgotPassword(email: string): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/json, text/plain, */*',
      'Skip-Token-Injection': 'true'
    });

    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, {email}, {
      headers,
      responseType: 'text'
    }).pipe(
      map(response => {
        try {
          return JSON.parse(response);
        } catch (e) {
          return {message: response};
        }
      }),
      catchError(error => {
        console.error('Forgot password error:', error);
        throw error;
      })
    );
  }

  /**
   * Validates reset token
   * @param token Reset token
   * @returns Observable<boolean>
   */
  validateResetToken(token: string): Observable<boolean> {
    const headers = new HttpHeaders({
      'Skip-Token-Injection': 'true'
    });

    return this.http.get<boolean>(`${environment.apiUrl}/auth/validate-reset-token?token=${token}`, {headers})
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Token validation error:', error);
          return of(false);
        })
      );
  }

  /**
   * Resets password with token
   * @param token Reset token
   * @param newPassword New password
   * @returns Observable with response
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    const headers = new HttpHeaders({
      'Accept': 'application/json, text/plain, */*',
      'Skip-Token-Injection': 'true'
    });

    return this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token,
      newPassword
    }, {
      headers,
      responseType: 'text'
    }).pipe(
      map(response => {
        try {
          return JSON.parse(response);
        } catch (e) {
          return { message: response };
        }
      }),
      catchError(error => {
        console.error('Reset password error:', error);
        throw error;
      })
    );
  }
}
