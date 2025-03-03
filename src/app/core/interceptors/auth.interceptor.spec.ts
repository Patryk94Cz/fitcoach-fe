// src/app/core/interceptors/auth.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { HttpHandlerFn, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    });
  });

  it('should add authorization header when token is available', () => {
    // Arrange
    const token = 'test-jwt-token';
    authServiceMock.getToken.and.returnValue(token);

    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = jasmine.createSpy('next').and.returnValue(of({}));

    // Act
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next);
    });

    // Assert
    expect(next).toHaveBeenCalled();

    // Get the modified request from the next handler
    const modifiedReq = (next as jasmine.Spy).calls.first().args[0] as HttpRequest<any>;
    expect(modifiedReq.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not modify request when token is not available', () => {
    // Arrange
    authServiceMock.getToken.and.returnValue(null);

    const req = new HttpRequest('GET', '/api/test');
    const next: HttpHandlerFn = jasmine.createSpy('next').and.returnValue(of({}));

    // Act
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next);
    });

    // Assert
    expect(next).toHaveBeenCalledWith(req); // Original request passed through
  });

  it('should not add token for requests with Skip-Token-Injection header', () => {
    // Arrange
    const token = 'test-jwt-token';
    authServiceMock.getToken.and.returnValue(token);

    const req = new HttpRequest('GET', '/api/health', null, {
      headers: new HttpRequest('GET', '/api/health').headers.set('Skip-Token-Injection', 'true')
    });

    const next: HttpHandlerFn = jasmine.createSpy('next').and.returnValue(of({}));

    // Act
    TestBed.runInInjectionContext(() => {
      authInterceptor(req, next);
    });

    // Assert
    expect(next).toHaveBeenCalled();

    // If your implementation is supposed to add the token anyway, change this assertion
    // If your implementation is supposed to NOT add the token, verify the header is not present
    const passedReq = (next as jasmine.Spy).calls.first().args[0] as HttpRequest<any>;
    expect(passedReq.headers.has('Authorization')).toBeFalse(); // This should match your implementation
  });
});
