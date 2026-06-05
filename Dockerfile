# syntax = docker/dockerfile:1
# Use Node.js for building
FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV="production"

# Throw-away build stage to reduce size of final image
FROM base AS build
# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3
# Install node modules
COPY package-lock.json package.json ./
RUN npm install --legacy-peer-deps
# Copy application code
COPY . .
# Build application
RUN npm run build
# Remove development dependencies
RUN rm -rf node_modules && \
    npm install --omit=dev --legacy-peer-deps

# Final stage for app image
FROM base
# Copy built application
COPY --from=build /app /app
# Start the server by default, this can be overwritten at runtime
EXPOSE 8080
CMD [ "npm", "run", "start" ]
