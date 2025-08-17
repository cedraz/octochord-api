import { PaginationResultDto } from 'src/shared/entities/pagination-result.entity';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { UserPaginationDto } from '../application/dto/user.pagination.dto';

export abstract class UserRepository {
  abstract create(userEntity: UserEntity): Promise<UserEntity>;

  abstract findAll(
    userPaginationDto: UserPaginationDto,
  ): Promise<PaginationResultDto<UserEntity>>;

  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract findById(id: string): Promise<UserEntity | null>;

  abstract update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity>;
}
