import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GoogleSheetsService } from 'src/providers/google-sheets/google-sheets.service';
import { QueueNames } from '../utils/queue-names.helper';
import { IngestEventDto } from '../dto/ingest-event.dto';

@Processor(QueueNames.INGEST_EVENT_QUEUE)
export class IngestEventConsumerService extends WorkerHost {
  constructor(private googleSheetsService: GoogleSheetsService) {
    super();
  }

  async process({ data }: Job<IngestEventDto>) {
    const { googleSheets, auth, spreadsheetId } =
      await this.googleSheetsService.getAuthSheets();

    const { id, name, email, date, event_type } = data;

    const values = [[id, name, email, date, event_type]];

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: 'Página1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
  }
}
