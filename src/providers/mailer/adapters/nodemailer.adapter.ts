import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { env } from 'src/shared/config/env.schema';
import { MailerProvider } from 'src/providers/mailer/mailer.provider';
import { createEmailTemplate } from '../utils/create-email-template';
import { SendEmailDto } from '../dto/send-email.dto';

@Injectable()
export class NodemailerAdapter implements MailerProvider {
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

  async sendEmail({ to, subject, message }: SendEmailDto): Promise<void> {
    const emailTemplate = createEmailTemplate({ message });

    await this.transporter.sendMail({
      to: `<${to}>`,
      from: `noreply <${env.MAIL_USER}>`,
      subject,
      html: emailTemplate.html,
    });
  }
}
