import {
  Controller,
  Body,
  Post,
  Delete,
  UseGuards,
  Patch,
  UnauthorizedException,
  Req,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { LoginDto } from '../application/dto/login.dto';
import { RefreshTokenDto } from '../application/dto/refresh-token.dto';
import { JwtAuthGuard } from '../application/guards/access-token-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TAuthenticatedUser } from 'src/shared/types/authenticated-user';
import { ChangePasswordDto } from '../application/dto/change-password.dto';
import { ChangeEmailDto } from '../application/dto/change-email.dto';
import { ValidateOneTimeCodeDto } from 'src/shared/application/dto/validate-one-time-code.dto';
import { RecoverPasswordDto } from '../application/dto/recover-password.dto';
import { VerificationType } from 'src/shared/domain/enums/verification-type.enum';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { VerifyEmailDto } from '../application/dto/verify-email.dto';
import { Request } from 'express';
import { GoogleOauthGuard } from '../application/guards/google-oauth.guard';
import { CurrentGoogleUser } from 'src/shared/decorators/google-user.decorator';
import { GoogleUser } from '../domain/types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @ApiOperation({ summary: 'User login' })
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(loginDto, req);
  }

  @Get('/google')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({
    summary:
      'Google OAuth login, using this route you gonna be redirected to Google',
  })
  googleAuth() {
    return;
  }

  @Get('/google/callback')
  @UseGuards(GoogleOauthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  googleAuthCallback(@CurrentGoogleUser() user: GoogleUser) {
    console.log('Google OAuth callback hit');
    console.log(user);
    return this.authService.googleLogin(user);
  }

  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh token' })
  userRefresh(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(refreshTokenDto, req);
  }

  @Delete('/logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  userLogout(@CurrentUser() user: TAuthenticatedUser) {
    return this.authService.logout(user.sub);
  }

  @Post('/verify-email')
  @ApiOperation({ summary: 'Verify an email address using a one-time code' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Patch('/change-email')
  @ApiOperation({ summary: 'Send email verification to change email address' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createChangeEmailOTC(
    @CurrentUser() user: TAuthenticatedUser,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    return this.authService.createChangeEmailOTC(
      user.sub,
      changeEmailDto.newEmail,
    );
  }

  @Post('/change-email-validation')
  @ApiOperation({ summary: 'Validate a verification request for change email' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  validateChangeEmailOTC(
    @Body() dto: ValidateOneTimeCodeDto,
    @CurrentUser() user: TAuthenticatedUser,
  ) {
    return this.authService.validateChangeEmailOTC(user.sub, dto);
  }

  @Patch('/recover-password')
  @ApiOperation({ summary: 'Recover the user password' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  recoverPassword(
    @CurrentUser() user: TAuthenticatedUser,
    @Body() recoverPasswordDto: RecoverPasswordDto,
  ) {
    if (user.otcType !== VerificationType.PASSWORD_RESET) {
      throw new UnauthorizedException(
        ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
      );
    }

    return this.authService.recoverPassword(recoverPasswordDto);
  }

  @Patch('/change-password')
  @ApiOperation({ summary: 'Change logged user password' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: TAuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.sub,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
}
