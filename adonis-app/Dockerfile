# Utilisation d'une image Node.js légère et récente
ARG NODE_IMAGE=node:22.16.0-bookworm
FROM $NODE_IMAGE AS base

# Installation de dumb-init pour gérer les signaux (meilleure pratique)
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

# Configuration de l'utilisateur et du répertoire de travail
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node

# Étape des dépendances (cache optimisé)
FROM base AS dependencies
COPY --chown=node:node package*.json ./
RUN npm i --omit=dev

# Étape de développement (copie du code + build si nécessaire)
FROM dependencies AS dev
COPY --chown=node:node . .
RUN npm run build --if-present -- --ignore-ts-errors # Optionnel si vous utilisez TypeScript/Vite

# Commande par défaut pour le développement
CMD ["dumb-init", "node", "--inspect=0.0.0.0", "ace", "serve", "--watch"]

