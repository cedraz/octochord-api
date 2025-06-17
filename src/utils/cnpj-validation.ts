export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj) {
    return false;
  }

  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weights1[i];
  }
  const rest = sum % 11;
  const digit1 = rest < 2 ? 0 : 11 - rest;

  if (digit1 !== parseInt(cleaned[12])) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weights2[i];
  }
  const rest2 = sum % 11;
  const digit2 = rest2 < 2 ? 0 : 11 - rest2;

  return digit2 === parseInt(cleaned[13]);
}
