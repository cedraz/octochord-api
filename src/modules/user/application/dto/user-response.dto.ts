export class UserResponseDto {
  id: string;
  email: string;
  phone?: string | null;
  name: string;
  image?: string | null;
  emailVerifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
