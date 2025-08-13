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

  abstract recoverPassword(params: {
    email: string;
    password: string;
  }): Promise<any>;

  abstract changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<any>;

  abstract uploadAvatar(id: string, buffer: Buffer): Promise<UserEntity>;

  abstract changeEmail(userId: string, newEmail: string): Promise<any>;
}
