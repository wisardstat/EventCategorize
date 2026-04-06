FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_HOST_URL=http://localhost
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_HOST_URL=${NEXT_PUBLIC_HOST_URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_HOST_URL=http://localhost
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_HOST_URL=${NEXT_PUBLIC_HOST_URL}
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
RUN npm i --omit=dev --ignore-scripts && npm cache clean --force
EXPOSE 3000
CMD ["npm", "run", "start"]


