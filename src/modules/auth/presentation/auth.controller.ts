import {
  Controller,
  Body,
  Post,
  Delete,
  UseGuards,
  Patch,
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
import { ValidateOneTimeCodeDto } from 'src/modules/one-time-code/application/dto/validate-one-time-code.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('user')
  @ApiOperation({ summary: 'User login' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/refresh')
  @ApiOperation({ summary: 'Refresh token' })
  userRefresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Delete('/logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  userLogout(@CurrentUser() user: TAuthenticatedUser) {
    return this.authService.logout(user.sub);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify an email address using a one-time code' })
  verifyEmail(@Body() dto: ValidateOneTimeCodeDto) {
    return this.authService.verifyEmail(dto);
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

  @Post('change-email-validation')
  @ApiOperation({ summary: 'Validate a verification request for change email' })
  validateChangeEmailOTC(@Body() dto: ValidateOneTimeCodeDto) {
    return this.authService.validateChangeEmailOTC(dto);
  }
}
