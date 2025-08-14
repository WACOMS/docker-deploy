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
# pour créer et posséder le cache npm on passe temporairement root
USER root
COPY --chown=node:node package*.json ./
# crée le dossier de cache et donne les droits
RUN mkdir -p /home/node/.npm && chown -R node:node /home/node/.npm
# BuildKit cache mount (très rapide sur rebuilds) - nécessite DOCKER_BUILDKIT=1
RUN --mount=type=cache,target=/home/node/.npm \
    npm ci --omit=dev

# remettre les droits et repasser à node
RUN chown -R node:node /home/node
USER node

# Étape de développement (copie du code + build si nécessaire)
FROM dependencies AS dev
COPY --chown=node:node . .
RUN npm run build --if-present -- --ignore-ts-errors # Optionnel si vous utilisez TypeScript/Vite

# Commande par défaut pour le développement
CMD ["dumb-init", "node", "--inspect=0.0.0.0", "ace", "serve", "--watch"]

