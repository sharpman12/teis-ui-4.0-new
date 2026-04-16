# Stage 1: Build Angular app
FROM node:14.20.0 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve using NGINX
FROM nginx:alpine

# COPY --from=build dist /usr/share/nginx/html
COPY --from=build /app/dist/ng-app /usr/share/nginx/html

# Add entrypoint that injects runtime config from env
COPY docker-entrypoint.sh /usr/docker-entrypoint.sh
RUN chmod +x /usr/docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/usr/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]