import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';

import { SUPPRESS_ERROR_TOAST } from '../../../core/http/error.interceptor';
import { toApiRequestError } from '../../../shared/utils/errors';
import { ForgotPasswordService } from './forgot-password.service';

interface ForgotForm {
  email: FormControl<string>;
}

interface ResetForm {
  token: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPassword {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly forgotPasswordService = inject(ForgotPasswordService);
  private readonly router = inject(Router);

  protected readonly step = signal<1 | 2 | 3>(1);
  protected readonly submitting = signal(false);
  protected readonly formError = signal('');
  protected readonly hidePassword = signal(true);
  protected readonly hideConfirmPassword = signal(true);

  protected readonly forgotForm: FormGroup<ForgotForm> = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly resetForm: FormGroup<ResetForm> = this.fb.group(
    {
      token: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  protected async onSendCode(): Promise<void> {
    this.forgotForm.markAllAsTouched();
    if (this.forgotForm.invalid) {
      return;
    }
    this.submitting.set(true);
    this.formError.set('');
    const context = new HttpContext().set(SUPPRESS_ERROR_TOAST, true);
    const { email } = this.forgotForm.getRawValue();
    try {
      await this.forgotPasswordService.forgotPassword(email, context);
      this.step.set(2);
    } catch (error) {
      const apiError = toApiRequestError(error);
      if (apiError.status === 404) {
        this.formError.set('Email no registrado.');
      } else if (apiError.status === 422) {
        this.formError.set('Email inválido.');
      } else {
        this.formError.set(apiError.message);
      }
    } finally {
      this.submitting.set(false);
    }
  }

  protected async onResetPassword(): Promise<void> {
    this.resetForm.markAllAsTouched();
    if (this.resetForm.invalid) {
      return;
    }
    this.submitting.set(true);
    this.formError.set('');
    const context = new HttpContext().set(SUPPRESS_ERROR_TOAST, true);
    const { token, password } = this.resetForm.getRawValue();
    try {
      await this.forgotPasswordService.resetPassword(token, password, context);
      this.step.set(3);
    } catch (error) {
      const apiError = toApiRequestError(error);
      if (apiError.status === 400) {
        this.formError.set('Código de restablecimiento inválido o expirado.');
      } else {
        this.formError.set(apiError.message);
      }
    } finally {
      this.submitting.set(false);
    }
  }

  protected async goToLogin(): Promise<void> {
    await this.router.navigateByUrl('/login');
  }

  protected emailError(): string {
    const control = this.forgotForm.controls.email;
    if (control.hasError('required')) {
      return 'El email es obligatorio.';
    }
    if (control.hasError('email')) {
      return 'Introduce un email válido.';
    }
    return '';
  }

  protected tokenError(): string {
    const control = this.resetForm.controls.token;
    if (control.hasError('required')) {
      return 'El código es obligatorio.';
    }
    if (control.hasError('minlength') || control.hasError('maxlength')) {
      return 'El código debe tener exactamente 6 caracteres.';
    }
    return '';
  }

  protected passwordError(): string {
    const control = this.resetForm.controls.password;
    if (control.hasError('required')) {
      return 'La contraseña es obligatoria.';
    }
    if (control.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    return '';
  }

  protected confirmPasswordError(): string {
    const control = this.resetForm.controls.confirmPassword;
    if (control.hasError('required')) {
      return 'Confirma tu contraseña.';
    }
    if (this.resetForm.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden.';
    }
    return '';
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) {
      return null;
    }
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
}
