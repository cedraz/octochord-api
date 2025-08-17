import { VerificationType } from 'src/shared/enums/verification-type.enum';
import { MetadataVO } from '../value-objects/metadata.vo';

export class OneTimeCodeEntity {
  id: string;
  code: string;
  identifier: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: MetadataVO | null;
  type: VerificationType;

  constructor(props: Partial<OneTimeCodeEntity>) {
    Object.assign(this, props);
    if (this.metadata === undefined) {
      this.metadata = null;
    }
  }
}
