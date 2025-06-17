import { Injectable } from '@nestjs/common';
import { createEmailTemplate } from './utils/email-template';
import * as nodemailer from 'nodemailer';
import { env } from 'src/config/env-validation';

export type EmailData = {
  to: string;
  message: string;
  subject: string;
};

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_SECURE, // true for 465, false for other ports
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      },
      tls: {
        ciphers: 'SSLv3',
      },
    });
  }

  async sendVerifyEmailCode({ to, subject, message }: EmailData) {
    const emailTemplate = createEmailTemplate({ message });

    await this.transporter.sendMail({
      to: `<${to}>`,
      from: `noreply <${env.MAIL_USER}>`,
      subject,
      html: emailTemplate.html,
    });
  }
}
