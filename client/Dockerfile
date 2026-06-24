# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 生产阶段：Nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 配置
RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    try_files $$uri $$uri/ /index.html; \
  } \
  location /api {
    proxy_pass http://backend:5000; \
    proxy_http_version 1.1; \
    proxy_set_header Upgrade $$http_upgrade; \
    proxy_set_header Connection "upgrade"; \
    proxy_set_header Host $$host; \
    proxy_cache_bypass $$http_upgrade; \
  } \
  location /uploads {
    proxy_pass http://backend:5000; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
