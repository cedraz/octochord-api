import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Patch,
  Inject,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PasswordRecoveryAuthGuard } from 'src/modules/auth/guards/password-recovery.guard';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageValidationPipe } from 'src/common/pipes/image-validation.pipe';
import { OneTimeCodeResponseDto } from 'src/modules/one-time-code/application/dto/one-time-code-response.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { UserEntity } from '../domain/entities/user.entity';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { ChangeEmailDto } from '../application/dto/change-email.dto';
import { ChangePasswordDto } from '../application/dto/change-password.dto';
import { RecoverPasswordDto } from '../application/dto/recover-password.dto';
import { UpdateProfileDto } from '../application/dto/update-profile.dto';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UserServiceAPI } from '../application/user.service.interface';
import { USER_SERVICE_TOKEN } from 'src/common/tokens/tokens';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    @Inject(USER_SERVICE_TOKEN) private readonly userService: UserServiceAPI,
  ) {}

  @ApiOperation({ summary: 'Create a new user' })
  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  @ApiConflictResponse({
    type: MessageResponseDto,
    description: ErrorMessagesHelper.USER_ALREADY_EXISTS,
  })
  create(@Body() createUserDto: CreateUserDto) {
    console.log('Creating user with DTO:', createUserDto);
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Recover password' })
  @Post('recover-password')
  @ApiOkResponse({ type: OneTimeCodeResponseDto })
  @UseGuards(PasswordRecoveryAuthGuard)
  @ApiBearerAuth()
  recoverPassword(
    @Body() recoverPasswordDto: RecoverPasswordDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtPayload;
    console.log('Recovering password for user:', user.email);
    return this.userService.recoverPassword({
      email: user.email,
      password: recoverPasswordDto.password,
    });
  }

  @ApiOperation({ summary: 'Get logged user profile' })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Request() req: ExpressRequest) {
    const payload = req.user as JwtPayload;
    return this.userService.findById(payload.sub);
  }

  @ApiOperation({ summary: 'Update logged user profile' })
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateProfile(
    @Request() req: ExpressRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const user = req.user as JwtPayload;
    return this.userService.update(user.sub, updateProfileDto);
  }

  @Patch('/profile/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo para upload',
    schema: {
      type: 'object',
      properties: { image: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('image')) // 'image' é o nome do campo no formulário
  uploadProfileAvatar(
    @UploadedFile(new imageValidationPipe()) image: Express.Multer.File,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtPayload;

    return this.userService.uploadAvatar(user.sub, image.buffer);
  }

  @Patch('/profile/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change logged user password' })
  @ApiOkResponse({ type: MessageResponseDto })
  changePassword(
    @Request() req: ExpressRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = req.user as JwtPayload;
    return this.userService.changePassword(
      user.sub,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Patch('/profile/change-email')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Send email verification to change logged user email',
  })
  @ApiOkResponse({ type: MessageResponseDto })
  changeEmail(
    @Request() req: ExpressRequest,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    const user = req.user as JwtPayload;
    return this.userService.changeEmail(user.sub, changeEmailDto.newEmail);
  }
}
