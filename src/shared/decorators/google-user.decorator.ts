import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { GoogleUser } from 'src/modules/auth/domain/types';

export const CurrentGoogleUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as GoogleUser | undefined;

    return data ? user?.[data as keyof GoogleUser] : user;
  },
);
