// src/app/core/guards/auth.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = { url: '/dashboard' } as RouterStateSnapshot;

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
    spyOn(router, 'createUrlTree');
  });

  it('should allow access when user is authenticated', () => {
    // Arrange
    authServiceMock.isAuthenticated.and.returnValue(true);

    // Act
    const result = TestBed.runInInjectionContext(() => {
      return authGuard(dummyRoute, dummyState);
    });

    // Assert
    expect(result).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Arrange
    authServiceMock.isAuthenticated.and.returnValue(false);

    // Act
    TestBed.runInInjectionContext(() => {
      authGuard(dummyRoute, dummyState);
    });

    // Assert
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});
