# Etapa 1: construir o projeto React
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Etapa 2: servir os arquivos estáticos com NGINX
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
# remove config default e adiciona um mais amigável para SPA
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
