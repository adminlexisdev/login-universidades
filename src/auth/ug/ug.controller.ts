import {
    Controller,
    Post,
    Headers,
    Res,
    UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { UgService } from './ug.service';

@Controller('ug')
export class UgController {
    constructor(private readonly ugService: UgService) { }

    @Post('login')
    async login(@Headers('origin') origin: string, @Res({ passthrough: true }) res: Response) {
        if (!origin || !origin.includes('https://servicioenlinea.ug.edu.ec')) {
            throw new UnauthorizedException('not allowed');
        }

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
