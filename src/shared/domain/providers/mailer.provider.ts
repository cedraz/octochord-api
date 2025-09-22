export interface IMailerProvider {
  sendMail({
    to,
    subject,
    message,
  }: {
    to: string;
    subject: string;
    message: string;
  }): Promise<void>;
}
