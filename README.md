# Octocord

<p align="left">
  <img src="https://img.shields.io/badge/JSON-000?logo=json&logoColor=white" />
  <img src="https://img.shields.io/badge/Markdown-000?logo=markdown&logoColor=white" />
  <img src="https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Webpack-8DD6F9?logo=webpack&logoColor=black" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/ts--node-3178C6?logo=ts-node&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C1?logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?logo=axios&logoColor=white" />
  <img src="https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white" />
</p>

> Uma API robusta para monitoramento de saúde de APIs e integrações com GitHub e Discord

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.9.0-blue.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io/)

## ✨ Funcionalidades

- 🔐 **Autenticação JWT** com suporte a Google OAuth
- 📊 **Monitoramento de APIs** com verificações automáticas de saúde
- 🔗 **Integrações GitHub** com webhooks
- 💬 **Notificações Discord** via webhooks
- 📧 **Sistema de emails** com templates
- 🎯 **Códigos únicos** para verificação e reset de senha
- 📁 **Upload de arquivos** com Cloudinary
- ⚡ **Filas de processamento** com BullMQ

## 🚀 Quick Start

### Pré-requisitos

- Node.js 22.14.0+
- Docker e Docker Compose

### Instalação

1. **Clone o repositório**

```bash
git clone <seu-repositorio>
cd octocord
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie os serviços com Docker**

```bash
docker compose up -d
```

5. **Execute as migrações do banco**

```bash
npx prisma migrate dev
```

6. **Inicie a aplicação**

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000` e a documentação em `http://localhost:3000/docs`

## 🏗️ Estrutura do Projeto

```
src/
├── auth/                 # Autenticação e autorização
├── user/                 # Gerenciamento de usuários
├── integration/          # Integrações GitHub/Discord
├── api-health-check/     # Monitoramento de APIs
├── one-time-code/        # Códigos únicos
├── jobs/                 # Filas de processamento
├── providers/            # Integrações externas
│   ├── cloudinary/      # Upload de arquivos
│   ├── mailer/          # Envio de emails
│   └── google-sheets/   # Google Sheets
├── common/              # Utilitários compartilhados
├── config/              # Configurações
└── prisma/              # Modelos do banco de dados
```

## 🗄️ Banco de Dados

O projeto utiliza **PostgreSQL** com **Prisma ORM**. Principais entidades:

- **User**: Usuários do sistema
- **Integration**: Integrações GitHub/Discord
- **ApiHealthCheck**: Monitoramento de APIs
- **OneTimeCode**: Códigos de verificação

### Comandos úteis

```bash
# Gerar migration
npx prisma migrate dev

# Resetar banco (cuidado!)
npx prisma migrate reset

# Visualizar dados
npx prisma studio

# Seed do banco
npm run seed
```

## 🔧 Scripts Disponíveis

```bash
npm run start:dev      # Desenvolvimento
npm run start:prod     # Produção
npm run build          # Build da aplicação
npm run test           # Executar testes
npm run lint           # Linter
npm run format         # Formatação de código
```

## 📚 Documentação

A documentação da API está disponível via **Swagger** em `/docs` quando a aplicação estiver rodando.

## 🐳 Docker

### Serviços incluídos:

- **PostgreSQL**: Banco de dados principal
- **Redis**: Cache e filas de processamento

### Comandos Docker:

```bash
# Iniciar serviços
docker compose up -d

# Acessar PostgreSQL
docker exec -it postgres-octocord psql -U octocord -d octocorddb

# Parar serviços
docker compose down
```

## 🔗 Integrações

### GitHub

- Webhooks para eventos de repositório
- Notificações automáticas no Discord

### Discord

- Webhooks para notificações
- Integração com eventos GitHub

### Stripe

- Processamento de pagamentos
- Gerenciamento de assinaturas

### Cloudinary

- Upload e gerenciamento de imagens
- Otimização automática

---

**Desenvolvido com ❤️ por [@cedraz](https://github.com/cedraz)**
