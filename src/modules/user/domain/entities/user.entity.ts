import * as bcrypt from 'bcryptjs';

export class UserEntity {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  phone?: string | null;
  deletedAt?: Date | null;
  image?: string | null;
  emailVerifiedAt?: Date | null;

  static async createWithPassword(
    props: Partial<UserEntity> & { password: string },
  ): Promise<UserEntity> {
    const { password, ...data } = props;
    const passwordHash = await this.hashPassword(password);
    return new UserEntity({
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    });
  }

  static reconstruct(data: UserEntity) {
    return new UserEntity(data);
  }

  private static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(8);
    return bcrypt.hash(password, salt);
  }

  constructor(props: Partial<UserEntity>) {
    Object.assign(this, props);
  }
}
