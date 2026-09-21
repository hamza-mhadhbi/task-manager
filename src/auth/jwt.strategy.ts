import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';

// Namespaced config
import { authConfig } from './config/auth.config.js';

// Models
import { UserRole } from '../common/models/user.model.js';

interface Payload {
  username: string;
  sub: string;
  role: UserRole;
}

interface ValidateArgs extends Payload {}

interface ValidateReturnValue extends Omit<Payload, 'sub'> {
  userId: string;
  role: UserRole;
}

interface IJwtStrategy {
  validate(payload: ValidateArgs): ValidateReturnValue;
}

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy)
  implements IJwtStrategy
{
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret,
      issuer: config.issuer,
      audience: config.audience,
    });

    this.config = config;
  }

  public validate(payload: ValidateArgs): ValidateReturnValue {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
