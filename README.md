# Nestjs Base Template

## Nesse README

- [Para rodar a API](#para-rodar-a-api)
- [Docker e Hospedagem](#docker-e-hospedagem)
  - [Docker](#docker)
  - [Tunnel Cloudflare](#tunnel-cloudflare)
- [Banco de dados](#banco-de-dados)
- [Ferramentas da API](#ferramentas-da-api)
  - [Swagger](#swagger)
  - [Interceptors e Pipes](#interceptors-e-pipes)
- [Explicando algumas pastas](#explicando-algumas-pastas)
  - [Pasta Common](#pasta-common)
  - [Pasta Helpers](#pasta-helpers)
  - [Jobs](#jobs)

## Para rodar a API

Primeiramente é necessário instalar as dependências do projeto, para isso basta executar o seguinte comando:

```bash
npm install
```

**O Template foi criado utilizando a versão 22.14.0, ao tentar instalar as dependências com versões abaixo dessa pode ocorrer erros.**

Após instalada as dependências, basta executar o seguinte comando:

```bash
npm run start:dev
```

Para buildar a aplicação, basta executar o seguinte comando:

```bash
npm run build
```

Demais comandos se encontram no arquivo `package.json` na parte "scripts".

## Docker e Hospedagem

### Docker

O Docker inicia apenas o banco de dados e o banco Redis para cache e para as filas.

Para iniciar o docker, basta executar o seguinte comando:

```bash
docker compose up
```

Para utilizar o PSQL, basta executar o seguinte comando:

```
docker exec -it <container_name ou container_id> psql -U linkboost -d linkboostdb
```

**se precisar utilize o comando sudo**

### Tunnel Cloudflare

Para abrir um tunnel para a aplicação, instale o cloudflared e execute o seguinte comando:

```bash
cloudflared tunnel --url http://localhost:3000
```

**Lembre-se de substituir o `3000` pela porta que a aplicação está rodando.**

## Banco de dados

Toda o esquema do banco é gerado através do Prisma, para gerar a migration e aplicar o esquema no banco, basta executar o seguinte comando:

**Para desenvolvimento**

```bash
npx prisma migrate dev
```

Para resetar o banco de dados e aplicar as migrations novamente, basta executar o seguinte comando:

```
npx prisma migrate reset
```

(**Isso irá apagar todos os dados do banco de dados, então tenha cuidado ao utilizar esse comando.**)

**Para produção**

```bash
npx prisma migrate deploy
```

Para visualizar, criar, deletar e editar os dados em uma interface gráfica amigável, basta executar o seguinte comando:

```bash
npx prisma studio
```

Nesse template o esquema do banco será bem simples, apenas para demonstrar como esquematizar o banco e como os dados são estruturados.

## Ferramentas da API

### Swagger

Documentação automizada, basta seguir a lógica utilizada nos DTOs e nos controllers para poder tipar e validar os dados e visualizar corretamente eles no Swagger UI no navegador. Para ver a documentação basta acessar a rota `/docs`

### Interceptors e Pipes

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    disableErrorMessages: false,
  }),
);

app.useGlobalInterceptors(
  new PrismaErrorsInterceptor(),
  new ClassSerializerInterceptor(app.get(Reflector)),
);
```

O `PrismaErrorsInterceptor` é um interceptor que captura os erros do Prisma e os transforma em erros mais amigáveis para o usuário.

O `ValidationPipe` é um pipe que valida os dados que estão sendo enviados para a aplicação, ele utiliza os decorators de validação do class-validator. Sem ele toda a lógica de paginação e filtragem não irá funcionar corretamente.

## Explicando algumas pastas

### Pasta Common

Nessa pasta estão alguns arquivos utilizados em vários lugares da aplicação, principalmente dtos, entities e decorators

### Pasta Helpers

Nessa pasta está apenas um arquivo .helper que serve como tradução de alguns erros na aplicação.

### Jobs

Nessa pasta se encontra toda a lógica das filas e as filas criadas, isso inclui envio de email através do BullMQ e uma função para limpar os "verification_requests" que já foram utilizados ou que estão expirados.

### Providers

Nessa pasta se encontram os providers que são utilizados na aplicação, que são essencialmente APIs externas que são consumidas pela aplicação, como o Google, CLoudinary, Stripe, Via CEP e o serviço de envio de email.
