import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { env } from 'src/config/env-validation';

@Injectable()
export class RefreshAuthGuard extends JwtAuthGuard {
  constructor(
    protected jwtService: JwtService,
    protected readonly prismaService: PrismaService,
  ) {
    super(jwtService, prismaService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(ErrorMessagesHelper.NO_TOKEN_PROVIDED);
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: env.REFRESH_TOKEN_SECRET,
      });

      request['user'] = payload;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException(ErrorMessagesHelper.INVALID_TOKEN);
    }

    return true;
  }
}
