import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject } from '@nestjs/common';
import { IUserRepository } from '../../../application/common/interfaces/user.repository.interface';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { TOKENS } from '../../../application/common/tokens/tokens';

interface JwtPayload {
  sub: number;
  email: string;
  roles: UserRole[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'default-secret-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    // Verificar que el usuario existe en la DB y está activo
    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      return null; // Passport devolverá 401
    }
    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
  }
}
