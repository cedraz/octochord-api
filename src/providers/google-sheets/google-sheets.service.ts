import { Injectable } from '@nestjs/common';
// import { google, sheets_v4 } from 'googleapis';
// import { env } from 'src/config/env-validation';

// type GoogleAuthInstance = InstanceType<typeof google.auth.GoogleAuth>;

// export interface GoogleSheetsContext {
//   auth: GoogleAuthInstance;
//   googleSheets: sheets_v4.Sheets;
//   spreadsheetId: string;
// }

@Injectable()
export class GoogleSheetsService {
  constructor() {}

  // async getAuthSheets(): Promise<GoogleSheetsContext> {
  //   const clientEmail = env.GOOGLE_CLIENT_EMAIL;
  //   const privateKey = env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  //   const projectId = env.GOOGLE_PROJECT_ID;

  //   const auth = new google.auth.GoogleAuth({
  //     credentials: {
  //       client_email: clientEmail,
  //       private_key: privateKey,
  //     },
  //     projectId: projectId,
  //     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  //   });

  //   const spreadsheetId = env.GOOGLE_SPREADSHEET_ID;

  //   const googleSheets = google.sheets({ version: 'v4', auth });

  //   return {
  //     auth,
  //     googleSheets,
  //     spreadsheetId,
  //   };
  // }
}
