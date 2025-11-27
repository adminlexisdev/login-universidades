import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SamlStrategy } from './strategies/saml.strategy';
import { ClientsModule } from '../clients/clients.module';

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
  controllers: [AuthController],
  providers: [AuthService, SamlStrategy],
  exports: [JwtModule],
})
export class AuthModule {}
