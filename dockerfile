# Etapa 1: construir o projeto React
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Configurar repositórios e instalar dependências de build
RUN sed -i 's/https:\/\/dl-cdn.alpinelinux.org/http:\/\/dl-cdn.alpinelinux.org/' /etc/apk/repositories \
  && apk add --no-cache python3 make g++ autoconf automake libtool nasm pkgconfig libpng-dev \
  && npm config set strict-ssl false \
  && npm install --omit=dev

# Copiar código fonte e buildar
COPY . .
RUN npm run build

# Etapa 2: servir os arquivos estáticos com NGINX
FROM nginx:stable-alpine

# Copiar build do React
COPY --from=builder /app/build /usr/share/nginx/html

# Configurar NGINX para SPA
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
