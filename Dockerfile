# Utilisation de l'image officielle Node.sockets version slim

FROM node:18-slim

# Création du répertoire de travail de l'application
WORKDIR /usr/src/app

# Copie des fichiers nécessaires pour l'application (par exemple package.json)
COPY package*.json ./


# Installation des dépendances
RUN npm install



# Copie du reste des fichiers de l'application
COPY . .

# Exposition du port sur lequel le serveur Node.sockets écoutera
EXPOSE 8000

# Commande pour démarrer l'application
CMD ["npm", "start"]
