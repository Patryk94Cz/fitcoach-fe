// features/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  registrationSuccess = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/) // Dozwolone znaki: litery, cyfry, podkreślniki, kropki, myślniki
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/) // Co najmniej 1 mała litera, 1 wielka litera i 1 cyfra
      ]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    const registerData = {
      username: this.registerForm.value.username,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.isLoading = false;
        this.registrationSuccess = true;

        this.snackBar.open('Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.', 'OK', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        let errorMessage = 'Błąd rejestracji. Spróbuj ponownie.';

        if (error.status === 200 && error.error instanceof SyntaxError &&
          error.error.message.includes('not valid JSON')) {
          this.registrationSuccess = true;
          this.snackBar.open('Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.', 'OK', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
          return;
        }

        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors && error.error.errors.length > 0) {
            errorMessage = error.error.errors[0];
          }
        }

        this.snackBar.open(errorMessage, 'OK', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Registration error:', error);
      }
    });
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.registerForm.get('password');

    if (passwordControl?.hasError('required')) {
      return 'Hasło jest wymagane';
    }

    if (passwordControl?.hasError('minlength')) {
      return 'Hasło musi mieć co najmniej 6 znaków';
    }

    if (passwordControl?.hasError('pattern')) {
      return 'Hasło musi zawierać co najmniej jedną wielką literę, jedną małą literę i jedną cyfrę';
    }

    return '';
  }

  getUsernameErrorMessage(): string {
    const usernameControl = this.registerForm.get('username');

    if (usernameControl?.hasError('required')) {
      return 'Nazwa użytkownika jest wymagana';
    }

    if (usernameControl?.hasError('minlength')) {
      return 'Nazwa użytkownika musi mieć co najmniej 3 znaki';
    }

    if (usernameControl?.hasError('maxlength')) {
      return 'Nazwa użytkownika nie może przekraczać 20 znaków';
    }

    if (usernameControl?.hasError('pattern')) {
      return 'Nazwa użytkownika może zawierać tylko litery, cyfry, podkreślniki, kropki i myślniki';
    }

    return '';
  }
}
