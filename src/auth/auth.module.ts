import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { SamlStrategy } from 'src/saml.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'saml' })],
  controllers: [AuthController],
  providers: [AuthService, SamlStrategy],
})
export class AuthModule {}
