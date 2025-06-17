export function validateCPF(cpf: string): boolean {
  if (!cpf) {
    return false;
  }

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }

  const rest = sum % 11;
  const digit1 = rest < 2 ? 0 : 11 - rest;

  if (digit1 !== parseInt(cleaned[9])) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  const rest2 = sum % 11;
  const digit2 = rest2 < 2 ? 0 : 11 - rest2;

  return digit2 === parseInt(cleaned[10]);
}
