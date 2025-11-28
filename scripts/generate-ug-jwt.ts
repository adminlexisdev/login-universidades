import { JwtService } from '@nestjs/jwt';

const [service, cuenta, userName = 'Estudiante UG'] = process.argv.slice(2);

if (!service || !cuenta) {
  // eslint-disable-next-line no-console
  console.error(
    'Usage: npm run generate:ug-jwt -- <service> <cuenta> [userName]',
  );
  process.exit(1);
}

const jwtSecret =
  process.env.JWT_UG_SECRET ?? 'd7ee5f64-596f-4453-a6ef-7b8a387dda11';
const jwtExpiresIn = process.env.JWT_UG_EXPIRES_IN ?? '1y';

const jwtService = new JwtService({
  secret: jwtSecret,
  signOptions: {
    expiresIn: jwtExpiresIn,
  },
});

const payload: Record<string, unknown> = {
  data: {
    usuNombre: userName,
    authorities: ['ROLE_USUARIO'],
    service,
    cuenta,
    services: [service],
  },
  user_name: 'ug-generic-user',
  client_id: service,
  scope: ['read'],
  authorities: ['ROLE_USUARIO'],
  jti: '',
};

const token = jwtService.sign(payload);

// eslint-disable-next-line no-console
console.log('UG JWT generated successfully:\n');
// eslint-disable-next-line no-console
console.log(token);
