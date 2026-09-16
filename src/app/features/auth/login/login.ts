import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { SessionStore } from '../../../core/auth/session.store';
import { SUPPRESS_ERROR_TOAST } from '../../../core/http/error.interceptor';
import { toApiRequestError } from '../../../shared/utils/errors';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form: FormGroup<LoginForm> = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  protected readonly submitting = signal(false);
  protected readonly formError = signal('');
  protected readonly hidePassword = signal(true);

  protected async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    this.formError.set('');
    const context = new HttpContext().set(SUPPRESS_ERROR_TOAST, true);
    const { email, password } = this.form.getRawValue();
    try {
      await this.session.login({ email, password }, context);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      await this.router.navigateByUrl(returnUrl ?? '/');
    } catch (error) {
      const apiError = toApiRequestError(error);
      if (apiError.status === 429) {
        this.formError.set('Demasiados intentos. Espera 1 minuto antes de volver a intentarlo.');
      } else {
        this.formError.set(apiError.message);
      }
    } finally {
      this.submitting.set(false);
    }
  }

  protected emailError(): string {
    const control = this.form.controls.email;
    if (control.hasError('required')) {
      return 'El email es obligatorio.';
    }
    if (control.hasError('email')) {
      return 'Introduce un email válido.';
    }
    return '';
  }

  protected passwordError(): string {
    const control = this.form.controls.password;
    if (control.hasError('required')) {
      return 'La contraseña es obligatoria.';
    }
    if (control.hasError('minlength')) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    return '';
  }
}
