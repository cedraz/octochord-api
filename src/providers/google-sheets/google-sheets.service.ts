import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { env } from 'src/config/env-validation';
import { JWT } from 'google-auth-library';

@Injectable()
export class GoogleSheetsService {
  constructor() {}

  async getAuthSheets() {
    const clientEmail = env.GOOGLE_CLIENT_EMAIL;
    const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const projectId = env.GOOGLE_PROJECT_ID;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      projectId: projectId,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

    const client = (await auth.getClient()) as JWT;
    const googleSheets = google.sheets({ version: 'v4', auth: client });

    return {
      auth,
      client,
      googleSheets,
      spreadsheetId,
    };
  }
}
