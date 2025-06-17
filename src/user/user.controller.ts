import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Request,
  Put,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PasswordRecoveryAuthGuard } from 'src/auth/guards/password-recovery.guard';
import { Request as ExpressRequest } from 'express';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageValidationPipe } from 'src/common/pipes/image-validation.pipe';
import { UserSimple } from './entities/user.entity';
import { OneTimeCodeResponseDto } from 'src/one-time-code/dto/one-time-code-response.dto';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Create a new user',
  })
  @Post()
  @ApiCreatedResponse({ type: UserSimple })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({
    summary: 'Recover password',
  })
  @Post('recover-password')
  @ApiOkResponse({
    type: OneTimeCodeResponseDto,
  })
  @UseGuards(PasswordRecoveryAuthGuard)
  @ApiBearerAuth()
  recoverPassword(
    @Body() recoverPasswordDto: RecoverPasswordDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtPayload;
    return this.userService.recoverPassword({
      email: user.email,
      password: recoverPasswordDto.password,
    });
  }

  @ApiOperation({
    summary: 'Get logged user profile',
  })
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: UserSimple,
  })
  async getProfile(@Request() req: ExpressRequest) {
    const payload = req.user as JwtPayload;
    return this.userService.findById(payload.sub);
  }

  @ApiOperation({
    summary: 'Delete logged user profile',
  })
  @Delete('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removeLoggedUser(@Request() req: ExpressRequest) {
    const user = req.user as JwtPayload;
    return this.userService.inactivateUser(user.sub);
  }

  @ApiOperation({
    summary: 'Update logged user profile',
  })
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: UserSimple,
  })
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
  @ApiOperation({
    summary: 'Upload user avatar',
  })
  @ApiOkResponse({
    type: UserSimple,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivo para upload',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image')) // 'image' é o nome do campo no formulário
  uploadProfileAvatar(
    @UploadedFile(new imageValidationPipe()) image: Express.Multer.File,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtPayload;

    return this.userService.uploadAvatar(user.sub, image);
  }

  @Patch('/profile/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change logged user password',
  })
  @ApiOkResponse({
    type: MessageResponseDto,
  })
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
  @ApiOkResponse({
    type: MessageResponseDto,
  })
  changeEmail(
    @Request() req: ExpressRequest,
    @Body() changeEmailDto: ChangeEmailDto,
  ) {
    const user = req.user as JwtPayload;
    return this.userService.changeEmail(user.sub, changeEmailDto.newEmail);
  }

  // @ApiOperation({
  //   summary: 'Ger all users',
  // })
  // @Get()
  // @ApiPaginatedResponse(UserSimple)
  // findAll(@Query() pagination: UserPaginationDto) {
  //   return this.userService.findAll(pagination);
  // }
  // @ApiOperation({
  //   summary: 'Get user by id',
  // })
  // @Get(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // findById(@Param('id') id: string) {
  //   return this.userService.findById(id);
  // }
  // @ApiOperation({
  //   summary: 'Update user',
  // })
  // @Put(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // @ApiOkResponse({
  //   type: UserSimple,
  // })
  // update(@Body() updateProfileDto: UpdateProfileDto, @Param('id') id: string) {
  //   return this.userService.update(id, updateProfileDto);
  // }

  // @ApiOperation({
  //   summary: 'Delete specific user',
  // })
  // @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth()
  // remove(@Param('id') id: string) {
  //   return this.userService.inactivateUser(id);
  // }

  // @Post('/avatar/:id')
  // @ApiOperation({
  //   summary: 'Upload user avatar',
  // })
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: 'Arquivo para upload',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       image: {
  //         type: 'string',
  //         format: 'binary',
  //       },
  //     },
  //   },
  // })
  // @UseInterceptors(FileInterceptor('image')) // 'image' é o nome do campo no formulário
  // uploadAvatar(
  //   @UploadedFile(new imageValidationPipe()) image: Express.Multer.File,
  //   @Param('id') id: string,
  // ) {
  //   return this.userService.uploadAvatar(id, image);
  // }
}
