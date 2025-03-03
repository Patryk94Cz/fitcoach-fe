// src/app/core/services/auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../../models/auth/login-request.model';
import { RegisterRequest } from '../../models/auth/register-request.model';
import { JwtResponse } from '../../models/auth/jwt-response.model';
import { User } from '../../models/user.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let localStorageSpy: jasmine.SpyObj<Storage>;
  const mockToken = 'mock-jwt-token';

  const mockLoginRequest: LoginRequest = {
    username: 'testuser',
    password: 'password123'
  };

  const mockRegisterRequest: RegisterRequest = {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'password123'
  };

  const mockAuthResponse: JwtResponse = {
    token: mockToken,
    type: 'Bearer',
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER'
  };

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER'
  };

  // Save original localStorage
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    // Create localStorage spy before initializing service
    localStorageSpy = jasmine.createSpyObj('Storage', ['getItem', 'setItem', 'removeItem']);

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy
    });

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' } // To simulate browser environment
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Move afterEach out of beforeEach and into the describe block
  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage
    });
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user and store token', () => {
      // Arrange
      localStorageSpy.setItem.and.callFake(() => {});

      // Act
      let authResponse: JwtResponse | undefined;
      service.login(mockLoginRequest).subscribe(response => {
        authResponse = response;
      });

      // Assert - Check request was made
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockLoginRequest);

      // Respond with mock data
      req.flush(mockAuthResponse);

      // Assert - Check response and side effects
      expect(authResponse).toEqual(mockAuthResponse);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('fitcoach_auth_token', mockToken);

      // Check if authentication state was updated
      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBeTrue();
      });

      // Check if current user was updated
      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should handle login error correctly', () => {
      // Act & Assert
      service.login(mockLoginRequest).subscribe({
        next: () => fail('Should have failed with 401 error'),
        error: (error) => expect(error.status).toBe(401)
      });

      // Simulate failed response
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });

      // Verify localStorage wasn't updated
      expect(localStorageSpy.setItem).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should register a new user', () => {
      // Act
      let response: any;
      service.register(mockRegisterRequest).subscribe(res => {
        response = res;
      });

      // Assert
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRegisterRequest);

      // Respond with success message
      req.flush({ message: 'User registered successfully' });

      // Check response
      expect(response.message).toBe('User registered successfully');
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch authenticated user profile', () => {
      // Act
      let userResponse: User | undefined;
      service.getCurrentUser().subscribe(user => {
        userResponse = user;
      });

      // Assert
      const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
      expect(req.request.method).toBe('GET');

      // Respond with mock user
      req.flush(mockUser);

      // Check if correct user was returned
      expect(userResponse).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear token and authentication state', () => {
      // Arrange - Simulate authenticated state
      (service as any).currentUserSubject.next(mockUser);
      (service as any).isAuthenticatedSubject.next(true);

      // Act
      service.logout();

      // Assert
      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('fitcoach_auth_token');

      // Check authentication state
      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBeFalse();
      });

      // Check user state was cleared
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists and is valid', () => {
      // Arrange
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxMDAwMDAwMDAwMH0.signature';
      localStorageSpy.getItem.and.returnValue(validToken);

      // Act & Assert
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when token does not exist', () => {
      // Arrange
      localStorageSpy.getItem.and.returnValue(null);

      // Act & Assert
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      // Arrange
      localStorageSpy.getItem.and.returnValue(mockToken);

      // Act & Assert
      expect(service.getToken()).toBe(mockToken);
      expect(localStorageSpy.getItem).toHaveBeenCalledWith('fitcoach_auth_token');
    });
  });

  describe('checkBackendHealth', () => {
    it('should return true when backend is available', () => {
      // Act
      let healthStatus: boolean | undefined;
      service.checkBackendHealth().subscribe(status => {
        healthStatus = status;
      });

      // Assert
      const req = httpMock.expectOne(`${environment.apiUrl}/public/health`);
      expect(req.request.method).toBe('GET');

      // Respond with success
      req.flush({ status: 'UP' });

      // Check result
      expect(healthStatus).toBeTrue();
    });

    it('should return false when backend is unavailable', () => {
      // Act
      let healthStatus: boolean | undefined;
      service.checkBackendHealth().subscribe(status => {
        healthStatus = status;
      });

      // Assert
      const req = httpMock.expectOne(`${environment.apiUrl}/public/health`);

      // Simulate server error
      req.error(new ErrorEvent('Network error'));

      // Check result
      expect(healthStatus).toBeFalse();
    });
  });
});
