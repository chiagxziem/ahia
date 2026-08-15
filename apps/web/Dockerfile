FROM oven/bun:1.3.11 AS base


# --- PREPARE STAGE ---
FROM base AS prepare
WORKDIR /app

RUN bun add -g turbo@^2.9.6
COPY . .

RUN turbo prune @repo/web --docker

# --- BUILDER STAGE ---
FROM base AS builder
WORKDIR /app

COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/full/packages ./packages
# hoisted linker: flattens all deps into root node_modules/ so a single COPY
# captures everything for the runner, keeping the image small and simple
RUN bun install --linker=hoisted

COPY --from=prepare /app/out/full/ .

RUN bunx turbo run build --filter=@repo/web

# --- RUNNER STAGE ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME="0.0.0.0" \
    PORT=3000

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/node_modules ./node_modules
# hoisted linker symlinks @repo/* packages into node_modules — copy their
# source to the runner so those symlinks resolve at runtime
COPY --from=builder /app/packages ./packages

RUN mkdir -p .next/cache && chown -R bun:bun /app

USER bun
EXPOSE 3000

ENTRYPOINT [ "/bin/sh", "-c", "bun run apps/web/server.js" ]
