import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { CloudinaryService } from 'src/providers/cloudinary/cloudinary.service';
import { MessageResponseDto } from 'src/shared/application/dto/message-response.dto';
import { UserRepository } from '../domain/user.repository';
import { UserEntity } from '../domain/entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { VerificationType } from 'src/shared/domain/enums/verification-type.enum';
import { UserServiceAPI } from './user.service.interface';
import { OneTimeCodeServiceAPI } from 'src/modules/one-time-code/application/one-time-code.service.interface';
import { OTC_SERVICE_TOKEN } from 'src/shared/tokens/tokens';
import { MinioService } from 'src/providers/minio/minio.service';

@Injectable()
export class UserService implements UserServiceAPI {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cloudinaryService: CloudinaryService,
    @Inject(OTC_SERVICE_TOKEN)
    private readonly oneTimeCodeService: OneTimeCodeServiceAPI,
    private readonly minioService: MinioService,
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
        expirationDate: this.oneTimeCodeService.getOneTimeCodeExpirationTime(), // 24 hours
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

  async uploadAvatar(id: string, file: Express.Multer.File) {
    const response = await this.minioService.uploadFile(file);

    const imageURL = response.url;

    return this.userRepository.update(id, {
      image: imageURL,
    });
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
