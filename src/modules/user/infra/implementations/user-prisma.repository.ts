import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserPaginationDto } from '../../application/dto/user.pagination.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserRepository } from '../../domain/user.repository';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userEntity: UserEntity) {
    console.log('Creating user with data:', userEntity);
    return this.prisma.user.create({
      data: userEntity,
    });
  }

  async findAll(userPaginationDto: UserPaginationDto) {
    const users = await this.prisma.user.findMany({
      where: userPaginationDto.where(),
      ...userPaginationDto.orderBy(),
    });

    const total = await this.prisma.user.count({
      where: userPaginationDto.where(),
    });

    return userPaginationDto.createMetadata(users, total);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }
}
