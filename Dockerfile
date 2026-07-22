FROM node:24-bookworm-slim AS base
WORKDIR /app

FROM base AS build
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
RUN rm -rf node_modules && \
    npm install --omit=dev --legacy-peer-deps

FROM base
ENV NODE_ENV="production"
COPY --from=build /app /app
EXPOSE 8080
CMD [ "npm", "run", "start" ]
