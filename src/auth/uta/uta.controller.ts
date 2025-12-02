import { Controller, Post, Headers, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UtaService } from './uta.service';
import { UniversityJwtGuard } from '../common/guards/university-jwt.guard';

@UseGuards(UniversityJwtGuard)
@Controller('uta')
export class UtaController {
    constructor(private readonly utaService: UtaService) { }

    @Post('login')
    async login(
        @Headers('origin') origin: string,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { token, session } = await this.utaService.login();

        res.cookie('lexis_session', session.cseCookieId, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600 * 1000,
        });

        return { token };
    }
}
