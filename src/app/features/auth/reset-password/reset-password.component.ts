// features/auth/reset-password/reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  token: string | null = null;
  tokenValid = false;
  checkingToken = true;
  passwordReset = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.validateToken();
      } else {
        this.checkingToken = false;
        this.snackBar.open('Brak tokenu resetowania hasła.', 'OK', { duration: 5000 });
      }
    });
  }

  validateToken(): void {
    if (!this.token) return;

    this.authService.validateResetToken(this.token).subscribe({
      next: () => {
        this.tokenValid = true;
        this.checkingToken = false;
      },
      error: () => {
        this.tokenValid = false;
        this.checkingToken = false;
        this.snackBar.open(
          'Token wygasł lub jest nieprawidłowy. Poproś o nowy link.',
          'OK',
          { duration: 5000 }
        );
      }
    });
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
    if (this.resetPasswordForm.invalid || !this.token) {
      Object.keys(this.resetPasswordForm.controls).forEach(key => {
        const control = this.resetPasswordForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.token, this.resetPasswordForm.value.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.passwordReset = true;
        this.snackBar.open(
          'Hasło zostało zmienione pomyślnie!',
          'OK',
          { duration: 5000 }
        );

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error.error?.message || 'Błąd podczas resetowania hasła. Spróbuj ponownie.',
          'OK',
          { duration: 5000 }
        );
      }
    });
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.resetPasswordForm.get('password');

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
}
