FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
# multi-monorepo project, need to copy all to install dependencies
COPY . .
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./

RUN npm install -g pnpm
# first build，and generate api json config
RUN pnpm build && pnpm run docs
# go to docs package, init prisma library, and build
RUN cd ./apps/docs && pnpm prisma generate && pnpm build:project

# production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/apps/docs/dist/standalone ./
COPY --from=builder /app/apps/docs/dist/static ./apps/docs/dist/static
COPY --from=builder /app/apps/docs/public ./apps/docs/public

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

WORKDIR /app/apps/docs

CMD ["node", "server.js"]