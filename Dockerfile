FROM node:16-slim AS builder
ARG YARN_TOKEN
WORKDIR /usr/src/app
COPY package.json yarn.lock .npmrc ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:16-slim AS server
USER node
ARG YARN_TOKEN 
# RUN apk add dumb-init

WORKDIR /usr/src/app
COPY package.json yarn.lock .npmrc ./
RUN yarn install --prod
COPY --from=builder ./usr/src/app/dist dist/

EXPOSE 5000
CMD ["node", "dist/app.js"]