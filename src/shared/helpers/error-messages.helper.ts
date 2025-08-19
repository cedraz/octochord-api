const notFoundErrorMessagesHelper = {
  USER_NOT_FOUND: 'Usuário não encontrado.',
  SUBSCRIPTION_NOT_FOUND: 'Assinatura não encontrada.',
  ADDRESS_NOT_FOUND: 'Endereço não encontrado para o CEP informado.',
  FILE_NOT_FOUND: 'Arquivo não encontrado.',
  HOOK_ID_NOT_FOUND: 'Hook ID não encontrado.',
  API_HEALTH_CHECK_NOT_FOUND: 'Verificação de saúde da API não encontrada.',
};

const dynamicErrorMessagesHelper = {
  serviceUnavailableException: (serviceName: string) =>
    `O serviço ${serviceName} está indisponível no momento. Tente novamente mais tarde.`,
  fileSizeLimitExceeded: (size: string) =>
    `O tamanho do arquivo excede o limite permitido de ${size}. Por favor, envie um arquivo menor.`,
  serviceUnavailableError(serviceName: string, error?: string) {
    return `O serviço ${serviceName} está indisponível no momento. Tente novamente mais tarde.${error ? ` Erro: ${error}` : ''}`;
  },
  regexValidationError: (field: string, message: string) =>
    `Erro de validação para o campo "${field}": ${message}`,
  unsopportedHttpMethod: (method: string) =>
    `Método HTTP "${method}" não suportado. Por favor, use um dos seguintes: GET, POST, PUT, DELETE, PATCH, HEAD.`,
};

export const ErrorMessagesHelper = {
  INVALID_SIGNATURE: 'Assinatura inválida. Nenhuma integração encontrada.',
  UNAUTHORIZED: 'Acesso não autorizado.',
  INVALID_CREDENTIALS: 'Credenciais inválidas.',
  FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
  INTERNAL_SERVER_ERROR: 'Erro interno do servidor.',
  CONFLICT: 'Ação conflitante.',
  NO_PAYMENT_METHODS: 'Nenhum método de pagamento encontrado.',
  EMAIL_NOT_VERIFIED: 'E-mail não verificado.',
  PRISMA_CLIENT_VALIDATION_ERROR: 'Erro de validação do cliente Prisma.',
  INVALID_VERIFICATION_REQUEST: 'Solicitação de verificação inválida.',
  USER_ALREADY_EXISTS: 'Usuário já existe.',
  INVALID_METADATA: 'Metadados inválidos.',
  CLOUDINARY_UPLOAD_ERROR: 'Erro ao fazer upload para o Cloudinary.',
  INVALID_PASSWORD: 'Senha inválida.',
  NO_TOKEN_PROVIDED: 'Nenhum token fornecido.',
  INVALID_TOKEN: 'Token inválido.',
  INVALID_IMAGE_FORMAT: 'Formato de imagem inválido.',
  ...notFoundErrorMessagesHelper,
  ...dynamicErrorMessagesHelper,
};
