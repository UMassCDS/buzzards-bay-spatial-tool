FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# FROM node:22-alpine as build-frontend
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM node:22-alpine as build-backend
# WORKDIR /backend
# COPY package*.json ./
# RUN npm install
# COPY backend/ .

# FROM nginx:stable-alpine
# COPY --from=build-frontend /app/dist /usr/share/nginx/html
# COPY --from=build-backend /backend /backend
# WORKDIR /backend
# RUN apk add --no-cache pm2
# EXPOSE 80 3000

# CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]

# # frontend build set up
# FROM  node:22-alpine as build
# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .
# # builds app
# RUN npm run build

# FROM nginx:stable-alpine
# COPY --from=build /app/dist /usr/share/nginx/html
# COPY --from=build /app/backend .

# EXPOSE 80

# CMD [ "nginx", "-g", "daemon off;" ]

# COPY . .
# RUN npm install

# ENV VITE_BACKEND_PORT=5174
# ENV VITE_FRONTEND_PORT=5173
# EXPOSE ${VITE_BACKEND_PORT} ${VITE_FRONTEND_PORT}

# CMD ["npm", "run", "startdev"]

# FROM node:18 AS builder
# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm install

# COPY . .

# RUN npm run build

# # Final stage
# FROM node:18
# WORKDIR /app

# COPY --from=builder /app/backend ./backend
# COPY --from=builder /app/dist ./dist
# COPY package.json package-lock.json ./
# COPY .env ./

# RUN npm install

# ENV VITE_BACKEND_PORT=5174
# ENV VITE_FRONTEND_PORT=5173
# EXPOSE ${VITE_BACKEND_PORT} ${VITE_FRONTEND_PORT}

# ENV VITE_ENTRY_POINT=index.html

# CMD ["npm", "run", "start"]

# FROM node:18 AS builder
# WORKDIR /app

# COPY package.json package-lock.json ./
# RUN npm install

# COPY . .

# RUN npm run build

# # Final stage
# FROM node:18
# WORKDIR /app

# COPY --from=builder /app/backend ./backend
# COPY --from=builder /app/dist ./frontend/dist
# COPY package.json package-lock.json ./
# COPY .env ./

# RUN npm install

# ENV VITE_BACKEND_PORT=5174
# ENV VITE_FRONTEND_PORT=5173
# EXPOSE ${VITE_BACKEND_PORT} ${VITE_FRONTEND_PORT}

# CMD ["npm", "run", "start"]
