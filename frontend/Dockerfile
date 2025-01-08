ARG VITE_BACKEND_IP

FROM node:22-alpine AS build

ENV VITE_BACKEND_IP=${VITE_BACKEND_IP}

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
