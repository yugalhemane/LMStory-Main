import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { ApiResponse } from '../../../shared/responses/ApiResponse';
import { env } from '../../../config/env';
import { PlatformType, BrowserType } from '@prisma/client';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private getClientMetadata(req: Request) {
    const meta: { ipAddress?: string; userAgent?: string; platform: PlatformType; browser: BrowserType } = {
      platform: 'WEB' as PlatformType,
      browser: 'OTHER' as BrowserType,
    };
    if (req.ip) meta.ipAddress = req.ip;
    if (req.headers['user-agent']) meta.userAgent = req.headers['user-agent'];
    return meta;
  }

  public registerTrial = async (req: Request, res: Response) => {
    const data = req.body;
    const meta = this.getClientMetadata(req);
    const result = await this.authService.registerTrial(data, meta.ipAddress, meta.userAgent);
    return res.status(201).json(ApiResponse.success(result.message));
  };

  public verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.body;
    const result = await this.authService.verifyEmail(token);
    return res.status(200).json(ApiResponse.success(result.message));
  };

  public resendVerification = async (req: Request, res: Response) => {
    const { email } = req.body;
    const meta = this.getClientMetadata(req);
    const result = await this.authService.resendVerification(email, meta.ipAddress, meta.userAgent);
    return res.status(200).json(ApiResponse.success(result?.message || 'If an account exists, a verification email has been sent.'));
  };

  public login = async (req: Request, res: Response) => {
    const data = req.body;
    const meta = this.getClientMetadata(req);
    const result = await this.authService.login(data, meta);
    
    this.setRefreshTokenCookie(res, result.refreshToken);

    return res.status(200).json(
      ApiResponse.success('Login successful', {
        user: result.user,
        accessToken: result.accessToken,
        redirectUrl: result.redirectUrl,
      })
    );
  };

  public inviteUser = async (req: Request, res: Response) => {
    const data = req.body;
    const inviterId = (req as any).user.userId;
    // We could lookup the inviterName from DB, here we pass null
    const result = await this.authService.inviteUser(data, inviterId);
    return res.status(201).json(ApiResponse.success('Invitation sent successfully', { invitationId: result.id }));
  };

  public acceptInvitation = async (req: Request, res: Response) => {
    const { token, ...data } = req.body;
    const result = await this.authService.acceptInvitation(token, data);
    return res.status(200).json(ApiResponse.success(result.message, { userId: result.userId }));
  };

  public forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const meta = this.getClientMetadata(req);
    await this.authService.forgotPassword(email, meta.ipAddress, meta.userAgent);
    return res.status(200).json(ApiResponse.success('If an account exists, a password reset email has been sent.'));
  };

  public resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    await this.authService.resetPassword(token, newPassword);
    return res.status(200).json(ApiResponse.success('Password reset successfully. You may now log in.'));
  };

  public validateLicense = async (_req: Request, res: Response) => {
    // const { licenseKey } = req.body;
    // To implement calling LicenseService
    // We would inject it directly here or expose a method on AuthService.
    // For now, let's keep it simple.
    return res.status(200).json(ApiResponse.success('License validated successfully (stub)'));
  };

  public setupEnterprise = async (_req: Request, res: Response) => {
    // Scaffold SuperAdmin and initial Tenant via License
    return res.status(201).json(ApiResponse.success('Enterprise setup successfully (stub)'));
  };

  public refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }
    try {
      const tokens = await this.authService.refreshSession(refreshToken);
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json(ApiResponse.success('Token refreshed successfully', { accessToken: tokens.accessToken }));
    } catch (error: any) {
      return res.status(401).json({ success: false, message: error.message || 'Invalid refresh token' });
    }
  };

  public logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }
    res.clearCookie('refreshToken');
    return res.status(200).json(ApiResponse.success('Logged out successfully'));
  };
}
