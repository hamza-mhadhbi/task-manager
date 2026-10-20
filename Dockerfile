ARG NODE_VERSION=24
ARG NODE_TAG=alpine

FROM node:${NODE_VERSION}-${NODE_TAG} AS builder

WORKDIR /app
COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-${NODE_TAG}
ENV NODE_ENV=production
ENV PORT=3000

USER node
WORKDIR /app
COPY --chown=node:node --from=builder /app/dist .
COPY --chown=node:node --from=builder /app/package*.json .

RUN npm ci --omit=dev --ignore-scripts

EXPOSE $PORT
CMD ["node", "main.js"]