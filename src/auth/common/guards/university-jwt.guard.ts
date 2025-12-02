import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UNIVERSITY_PUBLIC_METADATA_KEY } from '../decorators/skip-university-jwt.decorator';

@Injectable()
export class UniversityJwtGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            UNIVERSITY_PUBLIC_METADATA_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Missing bearer token');
        }

        try {
            const payload = this.jwtService.verify(token, {
                secret:
                    process.env.JWT_UNIVERSITY_SECRET ?? 'd7ee5f64-596f-4453-a6ef-7b8a387dda11',
            });
            request['universityJwtPayload'] = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid University JWT');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            return undefined;
        }

        const [scheme, token] = authHeader.split(' ');

        if (scheme !== 'Bearer' || !token) {
            return undefined;
        }

        return token;
    }
}
