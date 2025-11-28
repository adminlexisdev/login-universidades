import { Controller, Post, Headers, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UgService } from './ug.service';
import { UgJwtGuard } from './guards/ug-jwt.guard';

@UseGuards(UgJwtGuard)
@Controller('ug')
export class UgController {
  constructor(private readonly ugService: UgService) {}

  @Post('login')
  async login(
    @Headers('origin') origin: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, session } = await this.ugService.login();

    res.cookie('lexis_session', session.cseCookieId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 * 1000,
    });

    return { token };
  }
}
