# Build stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Output: static files in /dist
FROM alpine
COPY --from=builder /app/dist /dist
CMD ["cp", "-r", "/dist/.", "/web/"]
