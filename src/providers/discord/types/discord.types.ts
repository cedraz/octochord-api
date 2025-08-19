export type DiscordAPIError = {
  message: string;
  code: number;
};

export interface DiscordWebhookResponse {
  name: string;
  type: number;
  channel_id: string;
  token: string;
  avatar: any;
  guild_id: string;
  id: string;
  application_id: any;
  user: User;
}

export interface User {
  username: string;
  discriminator: string;
  id: string;
  avatar: string;
  public_flags: number;
}
