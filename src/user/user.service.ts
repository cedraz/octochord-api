import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { VerificationType } from '@prisma/client';
import { UserPaginationDto } from './dto/user.pagination.dto';
import { PaginationResultDto } from 'src/common/entities/pagination-result.entity';
import { CloudinaryService } from 'src/providers/cloudinary/cloudinary.service';
import { OneTimeCodeService } from 'src/one-time-code/one-time-code.service';
import { MessageResponseDto } from 'src/common/dto/message-response.dto';
import { UserSimple } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
    private oneTimeCodeService: OneTimeCodeService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<UserSimple | { message: string }> {
    const userExists = await this.findByEmail(createUserDto.email);

    if (userExists) {
      return this.handleExistingUser(userExists);
    }

    return this.prismaService.$transaction(async (prisma) => {
      const salt = await bcrypt.genSalt(8);
      const passwordHash = await bcrypt.hash(createUserDto.password, salt);

      const newUser = await prisma.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
          phone: createUserDto.phone,
          passwordHash,
        },
        select: userSelect,
      });

      await this.oneTimeCodeService.createOneTimeCode({
        createOneTimeCodeDto: {
          identifier: newUser.email,
          type: VerificationType.EMAIL_VERIFICATION,
        },
        expiresIn: this.oneTimeCodeService.getOneTimeCodeExpirationTime(),
      });

      return newUser;
    });
  }

  async handleExistingUser(user: UserSimple) {
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
    const oneTimeCode = await this.oneTimeCodeService.findByIdentifier(email);

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

  async findAll(
    userPaginationDto: UserPaginationDto,
  ): Promise<PaginationResultDto<UserSimple>> {
    const users = await this.prismaService.user.findMany({
      where: userPaginationDto.where(),
      ...userPaginationDto.orderBy(),
      select: userSelect,
    });

    const total = await this.prismaService.user.count({
      where: userPaginationDto.where(),
    });

    return userPaginationDto.createMetadata(users, total);
  }

  async findByEmail(email: string): Promise<UserSimple | null> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  findById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserSimple> {
    return this.prismaService.$transaction(async (prisma) => {
      return prisma.user.update({
        where: {
          id,
        },
        data: {
          ...updateUserDto,
        },
        select: userSelect,
      });
    });
  }

  async recoverPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    return {
      message: 'Senha alterada com sucesso.',
    };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<MessageResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

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

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    return {
      message: 'Senha alterada com sucesso.',
    };
  }

  async inactivateUser(id: string) {
    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return 'Usuário inativado com sucesso.';
  }

  async activateUser(id: string) {
    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        deletedAt: null,
      },
    });

    return 'Usuário reativado com sucesso.';
  }

  async uploadAvatar(id: string, image: Express.Multer.File) {
    const response = await this.cloudinaryService.uploadImage(image);

    const imageURL = response.secure_url as string;

    return await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        image: imageURL,
      },
      select: userSelect,
    });
  }

  async changeEmail(
    userId: string,
    newEmail: string,
  ): Promise<MessageResponseDto> {
    const userWithSameEmail = await this.findByEmail(newEmail);
    if (userWithSameEmail) {
      throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

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
}

export const userSelect = {
  id: true,
  email: true,
  phone: true,
  name: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  image: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  stripePriceId: true,
  stripeSubscriptionStatus: true,
};
