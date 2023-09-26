FROM node:18.16.0-slim as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm

# RUN corepack enable
COPY . /app
WORKDIR /app


FROM base AS storybook
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# RUN pnpm build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store cd packages/component && pnpm build-storybook

FROM base AS serve
RUN pnpm add http-server -w

FROM base
COPY --from=serve /app/node_modules /app/node_modules
COPY --from=storybook /app/packages/component/storybook-static /app/storybook-static


EXPOSE 3030

CMD ["pnpm", "http-server", "storybook-static", "-p", "3030"]