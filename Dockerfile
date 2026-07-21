# syntax = docker/dockerfile:1
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV="production"

FROM base AS build
# Install build dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3
# Copy ALL package files first to leverage cache
COPY package*.json ./
# Install ALL dependencies (including devDependencies) for the build
RUN npm install --legacy-peer-deps
# Copy the rest of the application code
COPY . .
# Build the application
RUN npm run build
# Remove development dependencies and reinstall only production ones
RUN rm -rf node_modules && \
    npm install --omit=dev --legacy-peer-deps

FROM base
# Copy built application and production node_modules
COPY --from=build /app /app
# Start the server
EXPOSE 8080
CMD [ "npm", "run", "start" ]
