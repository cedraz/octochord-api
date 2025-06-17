export class UserSimple {
  id: string;
  email: string;
  phone: string;
  name: string;
  image: string | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeSubscriptionStatus: string | null;
}

export class UserEntity extends UserSimple {}
