FROM node:14-slim AS build
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

FROM nginx:1.22.0
COPY --from=build /app/dist/slideshow /usr/share/nginx/html
