import {Injectable, PLATFORM_ID, inject} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, catchError, finalize, map, of, tap} from 'rxjs';
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

  private tokenKey = 'fitcoach_auth_token';
  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {

    this.loadStoredUser();
  }

  private loadStoredUser(): void {

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.tokenKey);

      if (token) {

        if (this.isTokenExpired(token)) {
          console.log('Token expired, removing from storage');
          localStorage.removeItem(this.tokenKey);
          return;
        }

        this.isLoadingSubject.next(true);
        this.isAuthenticatedSubject.next(true);


        const headers = new HttpHeaders().set('Skip-Token-Injection', 'true');


        this.http.get<User>(`${environment.apiUrl}/users/me`, {headers})
          .pipe(
            catchError(error => {
              console.error('Error loading user profile:', error);
              localStorage.removeItem(this.tokenKey);
              this.isAuthenticatedSubject.next(false);
              return of(null);
            }),
            finalize(() => {
              this.isLoadingSubject.next(false);
            })
          ).subscribe(user => {
          if (user) {
            this.currentUserSubject.next(user);
          }
        });
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
      'Accept': 'application/json, text/plain, */*'
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
   * Gets current authenticated user profile
   * @returns Observable with user data
   */
  getCurrentUser(): Observable<User> {

    const headers = new HttpHeaders().set('Skip-Token-Injection', 'true');

    return this.http.get<User>(`${environment.apiUrl}/users/me`, {headers})
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        }),
        catchError(error => {

          if (error.status === 401) {
            this.logout();
          }
          throw error;
        })
      );
  }

  /**
   * Logs out the current user
   * Clears token from storage and resets authentication state
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Handles successful authentication
   * @param authResponse Response from authentication API
   */
  private handleAuth(authResponse: JwtResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, authResponse.token);
    }

    const user: User = {
      id: authResponse.id,
      username: authResponse.username,
      email: authResponse.email,
      role: authResponse.role
    };

    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Gets the stored JWT token
   * @returns String token or null if not found
   */
  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  /**
   * Checks if user is authenticated
   * @returns Boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;


    return !this.isTokenExpired(token);
  }

  /**
   * Checks if the token is expired by decoding the JWT
   * @param token JWT token string
   * @returns Boolean indicating if token is expired
   */
  private isTokenExpired(token: string): boolean {
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
