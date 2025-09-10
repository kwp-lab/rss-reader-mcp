FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

ENV NODE_ENV=production
ENV TRANSPORT=httpStream
ENV PORT=8081
ENV MCP_SERVER_HOST=0.0.0.0

# Install dependencies
RUN npm ci --ignore-scripts --omit-dev

# Copy source code
COPY . .

# Build if needed
RUN npm run build

# Start the server
ENTRYPOINT ["node", "build/index.js"]