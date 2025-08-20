FROM node:20-alpine AS base

RUN npm i -g pnpm

FROM base AS build

WORKDIR /usr/app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm i --frozen-lockfile
RUN pnpm prisma generate

COPY . .

RUN pnpm build

FROM base as prunner

WORKDIR /usr/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm i --prod --frozen-lockfile

FROM node:20-alpine

WORKDIR /usr/app

COPY --from=build /usr/app/package.json ./package.json
COPY --from=build /usr/app/dist ./dist
COPY --from=prunner /usr/app/node_modules ./node_modules

CMD ["node", "dist/src/main.js"]