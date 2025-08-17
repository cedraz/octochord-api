import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { CloudinaryService } from 'src/providers/cloudinary/cloudinary.service';
import { MessageResponseDto } from 'src/shared/dto/message-response.dto';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../domain/user.repository';
import { UserEntity } from '../domain/entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { VerificationType } from 'src/shared/enums/verification-type.enum';
import { UserServiceAPI } from './user.service.interface';
import { OneTimeCodeServiceAPI } from 'src/modules/one-time-code/application/one-time-code.service.interface';
import { OTC_SERVICE_TOKEN } from 'src/shared/tokens/tokens';

@Injectable()
export class UserService implements UserServiceAPI {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(OTC_SERVICE_TOKEN)
    private readonly oneTimeCodeService: OneTimeCodeServiceAPI,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto | MessageResponseDto> {
    const userExists = await this.userRepository.findByEmail(
      createUserDto.email,
    );

    if (userExists) {
      return this.handleExistingUser(userExists);
    }

    const user = await UserEntity.createWithPassword(createUserDto);
    const { passwordHash: _passwordHash, ...userWithoutPassword } =
      await this.userRepository.create(user);

    await this.getOrCreateOneTimeCode(userWithoutPassword.email);

    return userWithoutPassword;
  }

  private async handleExistingUser(user: UserEntity) {
    if (user.emailVerifiedAt) {
      throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
    }

    const oneTimeCode = await this.getOrCreateOneTimeCode(user.email);

    return oneTimeCode.expires > new Date()
      ? { message: 'Código de verificação ainda é válido.' }
      : {
          message: 'Novo código de verificação enviado para o e-mail.',
        };
  }

  private async getOrCreateOneTimeCode(
    email: string,
  ): Promise<{ expires: Date }> {
    console.log(this.oneTimeCodeService);
    const oneTimeCode = await this.oneTimeCodeService.findByIdentifier({
      identifier: email,
    });

    if (
      !oneTimeCode ||
      this.oneTimeCodeService.isOneTimeCodeExpired(oneTimeCode)
    ) {
      const newOneTimeCode = await this.oneTimeCodeService.createOneTimeCode({
        createOneTimeCodeDto: {
          identifier: email,
          type: VerificationType.EMAIL_VERIFICATION,
        },
        expiresIn: this.oneTimeCodeService.getOneTimeCodeExpirationTime(), // 24 hours
      });

      return { expires: newOneTimeCode.expiresAt };
    }

    return { expires: oneTimeCode.expiresAt };
  }

  findById(id: string) {
    return this.userRepository.findById(id);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return this.userRepository.update(id, updateUserDto);
  }

  async recoverPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    console.log('Recovering password for email:', email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    const userUpdated = await this.userRepository.update(user.id, {
      passwordHash,
    });

    console.log('Password recovered for user:', userUpdated);

    return { message: 'Senha alterada com sucesso.' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<MessageResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new ConflictException(ErrorMessagesHelper.INVALID_PASSWORD);
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.userRepository.update(user.id, {
      passwordHash,
    });

    return { message: 'Senha alterada com sucesso.' };
  }

  async uploadAvatar(id: string, buffer: Buffer) {
    const response = await this.cloudinaryService.uploadImage(buffer);

    const imageURL = response.secure_url as string;

    return this.userRepository.update(id, {
      image: imageURL,
    });
  }

  async changeEmail(
    userId: string,
    newEmail: string,
  ): Promise<MessageResponseDto> {
    const userWithSameEmail = await this.userRepository.findByEmail(newEmail);

    if (userWithSameEmail) {
      throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    if (!user.emailVerifiedAt) {
      throw new ConflictException(ErrorMessagesHelper.EMAIL_NOT_VERIFIED);
    }

    await this.oneTimeCodeService.createOneTimeCode({
      createOneTimeCodeDto: {
        identifier: newEmail,
        type: VerificationType.EMAIL_VERIFICATION,
        metadata: {
          userId: user.id,
        },
      },
      expiresIn: this.oneTimeCodeService.getOneTimeCodeExpirationTime(),
    });

    return {
      message: 'Novo código de verificação enviado para o novo e-mail.',
    };
  }

  // async inactivateUser(id: string) {
  //   await this.userRepository.update(id, {
  //     deletedAt: new Date(),
  //   });

  //   return 'Usuário inativado com sucesso.';
  // }

  // async activateUser(id: string) {
  //   await this.userRepository.update(id, {
  //     deletedAt: null,
  //   });

  //   return 'Usuário reativado com sucesso.';
  // }
}
