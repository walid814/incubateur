FROM node:22

# Dossier de travail général
WORKDIR /app

# Installer Angular CLI globalement
RUN npm install -g @angular/cli

# Copier uniquement les fichiers nécessaires à l'installation des dépendances
COPY incubateur/package*.json ./incubateur/

# Aller dans le dossier du projet Angular
WORKDIR /app/incubateur

# Installer les dépendances Angular
RUN npm install

# Créer la configuration globale pour Angular CLI (désactiver l'analytics)
RUN mkdir -p /root/.config/angular && \
    echo '{ "version": 1, "cli": { "analytics": false } }' > /root/.config/angular/config.json

# Copier tout le contenu du projet Angular dans le conteneur
COPY incubateur/. .

# Exposer le port Angular
EXPOSE 4200

# Lancer le serveur Angular
CMD ["ng", "serve", "--host", "0.0.0.0","--poll=100"]
    