import { SendEmailDto } from './dto/send-email.dto';

export abstract class MailerProvider {
  abstract sendEmail(sendEmailDto: SendEmailDto): Promise<void>;
}
