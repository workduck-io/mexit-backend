FROM node:14-alpine AS builder

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:14-alpine AS server

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --prod
COPY --from=builder ./usr/src/app/dist .

EXPOSE 5000
CMD ["node", "dist/app.js"]
