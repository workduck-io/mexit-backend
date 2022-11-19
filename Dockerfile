FROM node:16-alpine AS builder
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN --mount=type=secret,id=npmrc,dst=.npmrc yarn install --frozen-lockfile && yarn cache clean
COPY . .
RUN yarn build

FROM node:16-alpine AS server
RUN apk add dumb-init
ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN --mount=type=secret,id=npmrc,dst=.npmrc yarn install --production=true --frozen-lockfile && yarn cache clean
COPY --from=builder ./usr/src/app/dist dist/

EXPOSE 5002
CMD ["dumb-init", "node", "dist/app.js"]