# Base image
FROM node:22-alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

# Build stage
FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=development /usr/src/app/node_modules ./node_modules

COPY . .

RUN npm run build

RUN npm prune --production

# Production stage
FROM node:22-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]
