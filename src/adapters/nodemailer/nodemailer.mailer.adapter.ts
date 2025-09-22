import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { env } from 'src/shared/config/env.schema';
import { createEmailTemplate } from './utils/create-email-template';
import { SendEmailDto } from '../../jobs/dto/send-email.dto';
import { IMailerProvider } from 'src/shared/domain/providers/mailer.provider';

@Injectable()
export class NodemailerMailerAdapter implements IMailerProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: true,
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      },
      tls: { ciphers: 'SSLv3' },
    });
  }

  async sendMail({ to, subject, message }: SendEmailDto): Promise<void> {
    const emailTemplate = createEmailTemplate({ message });

    await this.transporter.sendMail({
      to: `<${to}>`,
      from: `noreply <${env.MAIL_USER}>`,
      subject,
      html: emailTemplate.html,
    });
  }
}
