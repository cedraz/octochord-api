const notFoundErrorMessagesHelper = {
  USER_NOT_FOUND: 'Usuário não encontrado.',
  SUBSCRIPTION_NOT_FOUND: 'Assinatura não encontrada.',
  ADMIN_STRIPE_PLAN_NOT_FOUND: 'Plano do usuário não encontrado.',
  ADDRESS_NOT_FOUND: 'Endereço não encontrado para o CEP informado.',
  FILE_NOT_FOUND: 'Arquivo não encontrado.',
};

const dynamicErrorMessagesHelper = {
  serviceUnavailableException: (serviceName: string) =>
    `O serviço ${serviceName} está indisponível no momento. Tente novamente mais tarde.`,
  fileSizeLimitExceeded: (size: string) =>
    `O tamanho do arquivo excede o limite permitido de ${size}. Por favor, envie um arquivo menor.`,
};

export const ErrorMessagesHelper = {
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
