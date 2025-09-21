import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from '../domain/entities/user.entity';

export abstract class UserServiceAPI {
  abstract create(createUserDto: any): Promise<any>;

  abstract findById(id: string): Promise<UserEntity | null>;

  abstract findByEmail(email: string): Promise<UserEntity | null>;

  abstract update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity>;

  abstract uploadAvatar(
    id: string,
    file: Express.Multer.File,
  ): Promise<UserEntity>;
}
