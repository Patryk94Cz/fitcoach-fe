import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ActivatedRoute, Router} from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { JwtResponse } from '../../../models/auth/jwt-response.model';
import {RouterTestingModule} from '@angular/router/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockAuthResponse: JwtResponse = {
    token: 'mock-token',
    type: 'Bearer',
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER'
  };

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['login']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({}),
            queryParamMap: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty fields', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should mark form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should mark form as valid when all fields are filled correctly', () => {
    // Arrange
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    // Assert
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should mark password invalid if too short', () => {
    // Arrange
    const passwordControl = component.loginForm.get('password');

    // Act
    passwordControl?.setValue('12345'); // Less than 6 characters

    // Assert
    expect(passwordControl?.valid).toBeFalse();
    expect(passwordControl?.hasError('minlength')).toBeTrue();
  });

  it('should call auth service on form submission', () => {
    // Arrange
    authServiceMock.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    // Act
    component.onSubmit();

    // Assert
    expect(authServiceMock.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });

  it('should navigate to dashboard on successful login', () => {
    // Arrange
    authServiceMock.login.and.returnValue(of(mockAuthResponse));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    // Act
    component.onSubmit();

    // Assert
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error message on login failure', () => {
    // Arrange
    const errorResponse = {
      status: 401,
      error: { message: 'Invalid credentials' }
    };

    authServiceMock.login.and.returnValue(throwError(() => errorResponse));
    spyOn(component['snackBar'], 'open');

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpassword'
    });

    // Act
    component.onSubmit();

    // Assert
    expect(component.isLoading).toBeFalse();
    expect(component['snackBar'].open).toHaveBeenCalledWith(
      'Invalid credentials',
      'OK',
      jasmine.any(Object)
    );
  });

  it('should toggle password visibility', () => {
    // Arrange
    component.hidePassword = true;

    // Act
    const button = fixture.nativeElement.querySelector('button[type="button"]');
    button.click();

    // Assert
    expect(component.hidePassword).toBeFalse();
  });
});
