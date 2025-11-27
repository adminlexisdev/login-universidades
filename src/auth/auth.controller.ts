import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { SamlUser } from './interfaces/saml-user.interface';
import { Response } from 'express';

@Controller('sso')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('saml'))
  async samlLogin() {
    // Passport redirige a Microsoft automáticamente
  }

  @Post('/callback')
  @UseGuards(AuthGuard('saml'))
  async samlCallback(@Req() req, @Res({ passthrough: true }) res: Response) {
    const samlUser = req.user as SamlUser;
    const user = this.authService.mapSamlUser(samlUser);
    const { session, clientDomain, activeSessions, limit, cliService } =
      await this.authService.createSession(user.client_id, user.client_id);

    const userWithService = { ...user, service: cliService };
    const token = this.authService.createToken(userWithService);
    const ttlSeconds = this.authService.getSessionTtlSeconds();

    res.cookie('lexis_session', session.cseCookieId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ttlSeconds * 1000,
    });

    return {
      message: 'Login exitoso',
      user: userWithService,
      token,
      client: {
        domain: clientDomain,
        service: cliService,
        concurrency: {
          active: activeSessions,
          limit,
        },
      },
      session: {
        id: session.cseCookieId,
        expiresAt: session.expiresAt,
      },
    };
  }
}
