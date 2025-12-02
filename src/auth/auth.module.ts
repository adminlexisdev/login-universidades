import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SamlStrategy } from './strategies/saml.strategy';
import { ClientsModule } from '../clients/clients.module';
import { UgController } from './ug/ug.controller';
import { UgService } from './ug/ug.service';
import { UniversityJwtGuard } from './common/guards/university-jwt.guard';

const jwtSecret = process.env.JWT_SECRET ?? 'change_me';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '1h';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'saml' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
    ClientsModule,
  ],
  controllers: [AuthController, UgController],
  providers: [AuthService, SamlStrategy, UgService, UniversityJwtGuard],
  exports: [JwtModule],
})
export class AuthModule { }
