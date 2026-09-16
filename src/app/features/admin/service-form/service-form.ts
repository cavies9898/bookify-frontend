import { HttpContext } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal, ViewChild } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ServiceRequest, ServiceResponse } from '../../../shared/models/service';
import { timeRangeValidator } from '../../../shared/utils/validators';
import { toApiRequestError } from '../../../shared/utils/errors';
import { SUPPRESS_ERROR_TOAST } from '../../../core/http/error.interceptor';
import { ServicesService } from '../../services/services.service';
import { environment } from '../../../../environments/environment';
import { LocationMap } from '../../../shared/components/location-map/location-map';

export interface ServiceFormData {
  service: ServiceResponse | null;
}

interface ServiceFormModel {
  name: FormControl<string>;
  description: FormControl<string>;
  durationMinutes: FormControl<number>;
  capacity: FormControl<number>;
  price: FormControl<number>;
  openingTime: FormControl<string>;
  closingTime: FormControl<string>;
  location: FormControl<string>;
  latitude: FormControl<number | null>;
  longitude: FormControl<number | null>;
}

@Component({
  selector: 'app-service-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    LocationMap,
  ],
  templateUrl: './service-form.html',
  styleUrl: './service-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceForm {
  protected readonly environment = environment;
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly servicesService = inject(ServicesService);
  private readonly dialogRef = inject(MatDialogRef<ServiceForm>);
  private readonly data = inject<ServiceFormData>(MAT_DIALOG_DATA);

  protected readonly isEdit = this.data.service !== null;
  protected readonly submitting = signal(false);
  protected readonly formError = signal('');

  @ViewChild(LocationMap) protected readonly map!: LocationMap;

  protected readonly form: FormGroup<ServiceFormModel> = this.fb.group(
    {
      name: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.maxLength(100)]],
      durationMinutes: [60, [Validators.required, Validators.min(15)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      openingTime: ['09:00', [Validators.required]],
      closingTime: ['18:00', [Validators.required]],
      location: [''],
      latitude: [null as number | null],
      longitude: [null as number | null],
    },
    { validators: timeRangeValidator('openingTime', 'closingTime') },
  );

  constructor() {
    const service = this.data.service;
    if (service) {
      this.form.patchValue({
        name: service.name,
        description: service.description ?? '',
        durationMinutes: service.durationMinutes,
        capacity: service.capacity,
        price: service.price,
        openingTime: service.openingTime.slice(0, 5),
        closingTime: service.closingTime.slice(0, 5),
        location: service.location ?? '',
        latitude: service.latitude ?? null,
        longitude: service.longitude ?? null,
      });
      if (service.latitude != null && service.longitude != null) {
        setTimeout(() => this.map?.setCoordinates(service.latitude!, service.longitude!));
      }
    }
  }

  protected async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.submitting.set(true);
    this.formError.set('');

    const raw = this.form.getRawValue();
    const payload: ServiceRequest = {
      name: raw.name.trim(),
      description: raw.description.trim() || undefined,
      durationMinutes: raw.durationMinutes,
      capacity: raw.capacity,
      price: raw.price,
      openingTime: `${raw.openingTime}:00`,
      closingTime: `${raw.closingTime}:00`,
      location: raw.location?.trim() || undefined,
      latitude: raw.latitude ?? undefined,
      longitude: raw.longitude ?? undefined,
    };
    const context = new HttpContext().set(SUPPRESS_ERROR_TOAST, true);

    try {
      if (this.isEdit) {
        await this.servicesService.update(this.data.service!.id, payload, context);
      } else {
        await this.servicesService.create(payload, context);
      }
      this.dialogRef.close(true);
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
    if (control.hasError('maxlength')) {
      return 'El nombre no puede superar 120 caracteres.';
    }
    return '';
  }

  protected durationError(): string {
    const control = this.form.controls.durationMinutes;
    if (control.hasError('required') || control.hasError('min')) {
      return 'La duración debe ser de al menos 15 minutos.';
    }
    return '';
  }

  protected capacityError(): string {
    const control = this.form.controls.capacity;
    if (control.hasError('required') || control.hasError('min')) {
      return 'La capacidad debe ser de al menos 1 persona.';
    }
    return '';
  }

  protected priceError(): string {
    const control = this.form.controls.price;
    if (control.hasError('required') || control.hasError('min')) {
      return 'El precio no puede ser negativo.';
    }
    return '';
  }

  protected onLocationSelected(coords: { latitude: number; longitude: number }): void {
    this.form.patchValue({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }
}
