declare global {
  interface Window {
    BOOKIFY_API_URL?: string;
  }
}

export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' ? window.BOOKIFY_API_URL : undefined) ?? '/api',
  currency: 'EUR',
};
