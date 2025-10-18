# Utiliser Node.js 20 Alpine pour un build plus léger
FROM node:20-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Stage de build
FROM base AS builder

# Installer toutes les dépendances (dev + prod)
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application Nuxt
RUN npm run build

# Stage de production
FROM base AS runner


# Copier les fichiers nécessaires
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package.json /app/package.json


# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV DEV=false
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Commande de démarrage
CMD ["node", ".output/server/index.mjs"]
