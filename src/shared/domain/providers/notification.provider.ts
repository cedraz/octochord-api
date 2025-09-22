export interface INotificationProvider {
  sendMessage(dto: any): Promise<any>;
}
