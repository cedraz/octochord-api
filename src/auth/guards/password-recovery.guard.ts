import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { env } from 'src/config/env-validation';

@Injectable()
export class PasswordRecoveryAuthGuard
  extends JwtAuthGuard
  implements CanActivate
{
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (request.user) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException(ErrorMessagesHelper.NO_TOKEN_PROVIDED);
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: env.ACCESS_TOKEN_SECRET,
      });

      if (payload.type !== 'PASSWORD_RESET') {
        throw new ForbiddenException(ErrorMessagesHelper.FORBIDDEN);
      }

      const user = await this.prismaService.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
      }

      request['user'] = payload;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error(error);
      throw new UnauthorizedException(ErrorMessagesHelper.INVALID_TOKEN);
    }

    return true;
  }
}
