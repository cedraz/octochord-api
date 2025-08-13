import {
  Controller,
  Get,
  Request,
  Body,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { RequestWithUser } from 'src/common/types/request-with-user.interface';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ReqUser } from './entities/req-user.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('user')
  @ApiOperation({
    summary: 'User login',
  })
  @ApiCreatedResponse({
    type: LoginResponseDto,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('/user/refresh')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh token (user)',
  })
  @ApiOkResponse({ type: RefreshTokenResponseDto })
  @UseGuards(RefreshAuthGuard)
  userRefresh(@Request() req: ExpressRequest) {
    const user = req.user as JwtPayload;
    return this.authService.refreshAccessToken(user);
  }

  @Get('/validate-session/user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Check the access token for user',
  })
  @ApiOkResponse({ type: ReqUser })
  validateUserSession(@Request() req: RequestWithUser) {
    return req.user;
  }
}
