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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';

import { SessionStore } from '../../../core/auth/session.store';
import { SUPPRESS_ERROR_TOAST } from '../../../core/http/error.interceptor';
import { toApiRequestError } from '../../../shared/utils/errors';

interface RegisterForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  protected readonly form: FormGroup<RegisterForm> = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
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
    const { name, email, password } = this.form.getRawValue();
    try {
      await this.session.register({ name: name.trim(), email, password }, context);
      await this.router.navigateByUrl('/');
    } catch (error) {
      this.formError.set(toApiRequestError(error).message);
    } finally {
      this.submitting.set(false);
    }
  }

  protected nameError(): string {
    const control = this.form.controls.name;
    if (control.hasError('required')) {
      return 'El nombre es obligatorio.';
    }
    if (control.hasError('minlength')) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }
    return '';
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
