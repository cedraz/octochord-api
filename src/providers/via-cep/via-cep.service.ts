import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import {
  TViaCepErrorResponse,
  TViaCepResponse,
  ViaCepEntity,
} from './dto/via-cep-response.dto';

@Injectable()
export class ViaCepService {
  private readonly baseURL = 'https://viacep.com.br/ws';

  async getAddressByCep(cep: string): Promise<ViaCepEntity> {
    const request = await fetch(`${this.baseURL}/${cep}/json/`);

    if (!request.ok) {
      throw new ServiceUnavailableException(
        ErrorMessagesHelper.serviceUnavailableException('API ViaCep'),
      );
    }

    const data = (await request.json()) as
      | TViaCepResponse
      | TViaCepErrorResponse;

    if ('erro' in data && data.erro) {
      throw new NotFoundException(ErrorMessagesHelper.ADDRESS_NOT_FOUND);
    }

    const addressData = data as TViaCepResponse;

    const address: ViaCepEntity = {
      address_line: addressData.logradouro,
      address_number:
        addressData.complemento.length > 0 ? addressData.complemento : null,
      city: addressData.localidade,
      neighborhood: addressData.bairro,
      postal_code: addressData.cep.replace('-', ''),
      state: addressData.estado,
    };

    return address;
  }
}
