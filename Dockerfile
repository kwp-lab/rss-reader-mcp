# Builder
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Runtime
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
ENV TRANSPORT=httpStream
ENV PORT=8081
ENV MCP_SERVER_HOST=0.0.0.0
COPY package*.json ./
RUN npm ci --ignore-scripts --omit-dev
COPY --from=builder /app/build ./build
ENTRYPOINT ["node", "build/index.js"]