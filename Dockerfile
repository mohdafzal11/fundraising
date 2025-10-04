FROM node:23.11.1-bookworm-slim

WORKDIR /app

# Build args for all envs
ARG DATABASE_URL
ARG REDIS_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DOMAIN
ARG ADMIN_EMAILS
ARG ADMIN_PASSWORDS
ARG ADMIN_TOKEN_HASH
ARG UPLOAD_TARGET_URL
ARG NEXT_PUBLIC_APP_URL
ARG MINIO_ACCESS_KEY
ARG MINIO_SECRET_KEY
ARG APP_ID
ARG ANTHROPIC_API_KEY

# Set envs for build and runtime
ENV NODE_ENV=production \
    DATABASE_URL=${DATABASE_URL} \
    REDIS_URL=${REDIS_URL} \
    NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL} \
    NEXT_PUBLIC_DOMAIN=${NEXT_PUBLIC_DOMAIN} \
    ADMIN_EMAILS=${ADMIN_EMAILS} \
    ADMIN_PASSWORDS=${ADMIN_PASSWORDS} \
    ADMIN_TOKEN_HASH=${ADMIN_TOKEN_HASH} \
    UPLOAD_TARGET_URL=${UPLOAD_TARGET_URL} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY} \
    MINIO_SECRET_KEY=${MINIO_SECRET_KEY} \
    APP_ID=${APP_ID} \
    ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}


RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    curl \
    screen \
    procps \
    # Canvas dependencies
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    # Puppeteer dependencies
    chromium \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use system chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set pkg-config path for canvas dependencies
ENV PKG_CONFIG_PATH=/usr/lib/x86_64-linux-gnu/pkgconfig:/usr/share/pkgconfig

# Install node-gyp globally
RUN npm install -g node-gyp

# Copy files
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install dependencies with npm (better for native modules like canvas)
# Skip postinstall scripts during install to avoid prisma generate error
RUN npm ci --legacy-peer-deps --ignore-scripts

# Generate Prisma client
RUN npx prisma generate

# Copy rest of app
COPY . .

# Build with increased timeout and memory limit
ENV NEXT_BUILD_EXPORT_TIMEOUT=120
RUN NODE_OPTIONS="--max-old-space-size=2048" npx next build

# Verify build completed
RUN ls -la .next/ && \
    if [ ! -f .next/BUILD_ID ]; then echo "ERROR: BUILD_ID missing"; exit 1; fi && \
    echo "Build verified successfully"

# Copy and setup startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Create log directory for vc-updater
RUN mkdir -p /var/log && touch /var/log/vc-updater.log

EXPOSE 3000

# Use startup script to run both Next.js and VC updater
CMD ["/app/start.sh"]
