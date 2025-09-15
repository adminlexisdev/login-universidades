import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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
  async samlCallback(@Req() req) {
    console.log(req.user);
    return {
      message: 'Login successful',
      user: req.user,
    };
  }
}
