import { ApiClient } from './ApiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface RegisterTrialRequest {
  tenantName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class AuthClient {
  constructor(private client: ApiClient) {}

  public async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  public async logout(): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/logout');
    return response.data;
  }

  public async refresh(): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/refresh-token');
    return response.data;
  }

  public async me(): Promise<any> {
    const response = await this.client.get<any>('/auth/me');
    return response.data;
  }

  public async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/forgot-password', data);
    return response.data;
  }

  public async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/reset-password', data);
    return response.data;
  }

  public async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/verify', data);
    return response.data;
  }

  public async registerTrial(data: RegisterTrialRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register-trial', data);
    return response.data;
  }

  public async resendVerification(data: ResendVerificationRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/resend-verification', data);
    return response.data;
  }
}
