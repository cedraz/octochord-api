import { CreateStripeSCheckoutSessionDto } from './dto/create-stripe-checkout-session.dto';
import { CreateStripeMobileCheckoutDto } from './dto/create-stripe-mobile-checkout.dto';
import { FindUserByStripeInfoDto } from './dto/find-user-by-stripe-info.dto';
import { UpdateUserStripeInfoDto } from './dto/update-user-stripe-info.dto';
import { CreateStripeCustomerDto } from './dto/create-stripe-customer.dto';
import { HandleStripeWebhookDto } from './dto/handle-stripe-webhook.dto';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { env } from 'src/config/env-validation';
import Stripe from 'stripe';
import dayjs from 'dayjs';

@Injectable()
export class StripeService {
  private readonly stripeApiKey: string;
  private stripe: Stripe;

  constructor(private prismaService: PrismaService) {
    this.stripeApiKey = env.STRIPE_API_KEY;
    this.stripe = new Stripe(this.stripeApiKey, {
      apiVersion: '2024-06-20',
    });
  }

  async getCustomerByEmail(email: string) {
    const customer = await this.stripe.customers.list({
      email,
    });

    return customer.data[0];
  }

  async createCustomer(
    createStripeCustomerDto: CreateStripeCustomerDto,
  ): Promise<
    Stripe.Customer & {
      subscription_id: string;
      price_id: string;
      subscription_status: string;
    }
  > {
    const customer = await this.getCustomerByEmail(
      createStripeCustomerDto.email,
    );

    if (customer) {
      console.log('Caiu aqui');
      return {
        ...customer,
        subscription_id: customer.subscriptions.data[0].id,
        price_id: customer.subscriptions.data[0].items.data[0].price.id,
        subscription_status: customer.subscriptions.data[0].status,
      };
    }

    const createdCustomer = await this.stripe.customers.create({
      email: createStripeCustomerDto.email,
      name: createStripeCustomerDto.name,
    });

    const price_id = env.STRIPE_FREE_PRICE_ID;

    const subscription = await this.stripe.subscriptions.create({
      customer: createdCustomer.id,
      items: [
        {
          price: price_id,
        },
      ],
    });

    return {
      ...createdCustomer,
      subscription_id: subscription.id,
      price_id,
      subscription_status: subscription.status,
    };
  }

  async createCheckoutSession(
    createStripeSCheckoutSessionDto: CreateStripeSCheckoutSessionDto,
  ) {
    const subscription = await this.stripe.subscriptionItems.list({
      subscription: createStripeSCheckoutSessionDto.stripeSubscriptionId,
      limit: 1,
    });

    const session = await this.stripe.billingPortal.sessions.create({
      customer: createStripeSCheckoutSessionDto.stripeCustomerId,
      return_url: 'https://www.youtube.com/?themeRefresh=1',
      flow_data: {
        type: 'subscription_update_confirm',
        after_completion: {
          type: 'redirect',
          redirect: {
            return_url: 'https://www.youtube.com/?themeRefresh=1',
          },
        },
        subscription_update_confirm: {
          subscription: createStripeSCheckoutSessionDto.stripeSubscriptionId,
          items: [
            {
              id: subscription.data[0].id,
              price: env.STRIPE_PREMIUM_PRICE_ID,
              quantity: 1,
            },
          ],
        },
      },
    });

    return {
      url: session.url,
    };
  }

  async createMobileCheckout(
    createStripeMobileCheckoutDto: CreateStripeMobileCheckoutDto,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: { id: createStripeMobileCheckoutDto.userId },
    });

    const customer = await this.createCustomer({
      email: createStripeMobileCheckoutDto.email,
      name: user.name,
    });

    const ephemeralKey = await this.stripe.ephemeralKeys.create({
      customer: customer.id,
    });

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: createStripeMobileCheckoutDto.amount,
      currency: createStripeMobileCheckoutDto.currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // Desabilita redirecionamentos automáticos
      },
      description: createStripeMobileCheckoutDto.description,
      receipt_email: createStripeMobileCheckoutDto.email,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      checkout_data: {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
        email: createStripeMobileCheckoutDto.email,
        customer_id: customer.id,
      },
    };
  }

  async getUsersCurrentPlan(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    const subscription = await this.stripe.subscriptions.retrieve(
      user.stripeSubscriptionId,
    );

    const endDate = new Date(subscription.current_period_end * 1000);

    const daysRemaining = dayjs(endDate).diff(dayjs(), 'days');

    const freePlan = env.STRIPE_FREE_PRICE_ID;

    return {
      plan: user.stripePriceId === freePlan ? 'FREE' : 'PREMIUM',
      daysRemaining,
      endDate,
    };
  }

  async handleWebhook(handleStripeWebhookDto: HandleStripeWebhookDto) {
    const { signature, rawBody } = handleStripeWebhookDto;

    const stripeEvent = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );

    switch (stripeEvent.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionProcess({
          object: stripeEvent.data.object,
        });
        break;
      default:
        return;
    }
  }

  async handleSubscriptionProcess(event: { object: Stripe.Subscription }) {
    const stripeCustomerId = event.object.customer as string;
    const stripeSubscriptionId = event.object.id;
    const stripeSubscriptionStatus = event.object.status;
    const stripePriceId = event.object.items.data[0].price.id;

    const userExists = await this.findUserByStripeInfo({
      stripeCustomerId,
      stripeSubscriptionId,
    });

    // REFATORAR ESSE ERRO
    if (!userExists) {
      throw new Error('user of stripeCustomerId not found');
    }

    await this.updateUserStripeInfo(userExists.id, {
      stripePriceId,
      stripeSubscriptionId,
      stripeSubscriptionStatus,
    });
  }

  async findUserByStripeInfo({
    stripeCustomerId,
    stripeSubscriptionId,
  }: FindUserByStripeInfoDto) {
    return await this.prismaService.user.findFirst({
      where: { OR: [{ stripeSubscriptionId }, { stripeCustomerId }] },
      select: { id: true },
    });
  }

  async updateUserStripeInfo(id: string, data: UpdateUserStripeInfoDto) {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    return this.prismaService.user.update({ where: { id }, data: { ...data } });
  }
}
