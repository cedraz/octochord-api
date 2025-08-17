import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TAuthenticatedUser } from '../types/authenticated-user';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as TAuthenticatedUser | undefined;

    return data ? user?.[data as keyof TAuthenticatedUser] : user;
  },
);
