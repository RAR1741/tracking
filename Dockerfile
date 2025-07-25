ARG VARIANT="22-bookworm"
FROM mcr.microsoft.com/devcontainers/typescript-node:1-${VARIANT}

RUN su node -c "npm install -g pnpm@10 ts-node"
