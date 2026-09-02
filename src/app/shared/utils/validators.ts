import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function timeRangeValidator(openingControl: string, closingControl: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const opening = group.get(openingControl)?.value as string | null;
    const closing = group.get(closingControl)?.value as string | null;
    if (!opening || !closing || closing > opening) {
      return null;
    }
    return { timeRange: true };
  };
}

export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as number | null;
    if (value === null || value === undefined || Number.isNaN(value) || value < 0) {
      return { nonNegative: true };
    }
    return null;
  };
}
