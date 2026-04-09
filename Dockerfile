# Build stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_PUBLIC_POSTHOG_PROJECT_TOKEN
ARG VITE_PUBLIC_POSTHOG_HOST
RUN npm run build

# Output: static files in /dist
FROM alpine
COPY --from=builder /app/dist /dist
CMD ["cp", "-r", "/dist/.", "/web/"]
