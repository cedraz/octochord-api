import { Controller, Body, Post, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { LoginDto } from '../application/dto/login.dto';
import { RefreshTokenDto } from '../application/dto/refresh-token.dto';
import { JwtAuthGuard } from '../application/guards/access-token-auth.guard';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TAuthenticatedUser } from 'src/shared/types/authenticated-user';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('user')
  @ApiOperation({
    summary: 'User login',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/refresh')
  @ApiOperation({
    summary: 'Refresh token',
  })
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
}
