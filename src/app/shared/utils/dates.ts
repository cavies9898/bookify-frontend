export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toIsoDateTime(date: Date): string {
  return date.toISOString();
}

export function parseIso(iso: string): Date {
  return new Date(iso);
}

export function formatSlotTime(iso: string): string {
  const date = parseIso(iso);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatTimeOfDay(time: string): string {
  return time.length >= 5 ? time.slice(0, 5) : time;
}

export function minutesToLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} min`;
  }
  if (rest === 0) {
    return `${hours} h`;
  }
  return `${hours} h ${rest} min`;
}
