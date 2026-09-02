import { AuthResponse, User } from '../shared/models/auth';

export const testUser: User = {
  id: 1,
  name: 'Ana Pérez',
  email: 'ana@example.com',
  role: 'CLIENTE',
};

export const testAuthResponse: AuthResponse = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-456',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: testUser,
};
