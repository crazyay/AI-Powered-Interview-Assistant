FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies needed to build native modules
RUN apk add --no-cache python3 make g++ bash

# Copy package files
COPY package*.json ./

# Install dependencies (as root)
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create non-root user and set ownership
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001 \
    && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
