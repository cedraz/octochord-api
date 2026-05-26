FROM node:22-alpine AS builder

RUN npm install -g pnpm@10

# Habilita cache de dependências do pnpm entre builds
RUN pnpm config set store-dir /root/.local/share/pnpm/store

WORKDIR /app

# Copia só o necessário para instalar dependências
# Essa layer só rebuilda se package.json ou lockfile mudarem
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

RUN pnpm prisma generate

COPY . .

RUN pnpm run build

RUN pnpm prune --prod

# Imagem final — usa node:22-alpine em vez de alpine puro
# Evita problemas de compatibilidade com binários do Prisma
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

COPY prisma.sh .
RUN chmod +x prisma.sh
ENTRYPOINT ["./prisma.sh"]

CMD ["node", "dist/src/main"]