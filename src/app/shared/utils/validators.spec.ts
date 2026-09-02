import { FormControl, FormGroup } from '@angular/forms';

import { positiveNumberValidator, timeRangeValidator } from './validators';

describe('timeRangeValidator', () => {
  it('devuelve null cuando la apertura es anterior al cierre', () => {
    const group = new FormGroup({
      openingTime: new FormControl('09:00'),
      closingTime: new FormControl('18:00'),
    });
    expect(timeRangeValidator('openingTime', 'closingTime')(group)).toBeNull();
  });

  it('devuelve error timeRange cuando apertura >= cierre', () => {
    const group = new FormGroup({
      openingTime: new FormControl('18:00'),
      closingTime: new FormControl('09:00'),
    });
    expect(timeRangeValidator('openingTime', 'closingTime')(group)).toEqual({ timeRange: true });
  });

  it('devuelve null si falta alguno de los valores', () => {
    const group = new FormGroup({
      openingTime: new FormControl(''),
      closingTime: new FormControl('18:00'),
    });
    expect(timeRangeValidator('openingTime', 'closingTime')(group)).toBeNull();
  });
});

describe('positiveNumberValidator', () => {
  it('acepta valores >= 0', () => {
    expect(positiveNumberValidator()(new FormControl(0))).toBeNull();
    expect(positiveNumberValidator()(new FormControl(25.5))).toBeNull();
  });

  it('rechaza valores negativos', () => {
    expect(positiveNumberValidator()(new FormControl(-1))).toEqual({ nonNegative: true });
  });
});
