FROM node:22-alpine AS builder

WORKDIR /mydir

COPY package.json package-lock.json ./
RUN npm install
COPY . .

RUN npm run build

FROM caddy:alpine

COPY --from=builder ./mydir/build /usr/share/caddy

EXPOSE 80

CMD ["caddy", "file-server", "--root", "/usr/share/caddy", "--browse"]