import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserPaginationDto } from '../../application/dto/user.pagination.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserRepository } from '../../domain/user.repository';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userEntity: UserEntity) {
    return this.prisma.user.create({
      data: {
        email: userEntity.email,
        phone: userEntity.phone,
        name: userEntity.name,
        passwordHash: userEntity.passwordHash,
        createdAt: userEntity.createdAt,
        updatedAt: userEntity.updatedAt,
        deletedAt: userEntity.deletedAt,
        image: userEntity.image,
        emailVerifiedAt: userEntity.emailVerifiedAt,
      },
    });
  }

  async findAll(userPaginationDto: UserPaginationDto) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: userPaginationDto.where(),
        ...userPaginationDto.orderBy(),
      }),
      this.prisma.user.count({
        where: userPaginationDto.where(),
      }),
    ]);

    return userPaginationDto.createMetadata(users, total);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { refreshTokens: true },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data: {
        email: updateUserDto.email,
        phone: updateUserDto.phone,
        name: updateUserDto.name,
        image: updateUserDto.image,
        updatedAt: new Date(),
        emailVerifiedAt: updateUserDto.emailVerifiedAt,
      },
    });
  }
}
