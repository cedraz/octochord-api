import { PartialType } from '@nestjs/swagger';
import { UserEntity } from '../../domain/entities/user.entity';

export class UpdateUserDto extends PartialType(UserEntity) {}
