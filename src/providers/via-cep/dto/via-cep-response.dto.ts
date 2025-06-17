export class ViaCepEntity {
  postal_code?: string;
  address_line?: string;
  address_number?: string | null;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export type TViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  unidade: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
  regiao: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
};

export type TViaCepErrorResponse = {
  erro: boolean;
};
