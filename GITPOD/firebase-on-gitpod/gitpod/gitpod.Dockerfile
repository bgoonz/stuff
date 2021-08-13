FROM gitpod/workspace-full:latest

# Cache firebase
RUN npm install --global npm firebase firebase-tools