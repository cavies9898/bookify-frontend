import { formatSlotTime, formatTimeOfDay, minutesToLabel, toIsoDate } from './dates';

describe('toIsoDate', () => {
  it('formatea una fecha como YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2030, 5, 10))).toBe('2030-06-10');
  });
});

describe('formatSlotTime', () => {
  it('extrae HH:mm local de un instante ISO', () => {
    const iso = new Date(2030, 5, 10, 9, 30).toISOString();
    expect(formatSlotTime(iso)).toBe('09:30');
  });
});

describe('formatTimeOfDay', () => {
  it('reduce HH:mm:ss a HH:mm', () => {
    expect(formatTimeOfDay('09:00:00')).toBe('09:00');
  });
});

describe('minutesToLabel', () => {
  it('formatea duraciones en español', () => {
    expect(minutesToLabel(30)).toBe('30 min');
    expect(minutesToLabel(60)).toBe('1 h');
    expect(minutesToLabel(90)).toBe('1 h 30 min');
  });
});
