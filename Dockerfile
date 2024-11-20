FROM node:18 AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
# multi-monorepo project, need to copy all to install dependencies
COPY . .
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
RUN pnpm build
RUN pnpm build-storybook

FROM nginx:alpine AS runtime

COPY --from=builder /app/apps/storybook/nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/apps/storybook/storybook-static /usr/share/nginx/html

EXPOSE 8080