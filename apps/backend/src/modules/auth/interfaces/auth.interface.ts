import { User, Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  tenantId?: string | null;
  role: Role;
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}
