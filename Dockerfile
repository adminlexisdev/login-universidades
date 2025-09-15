# Usa una imagen base de Node.js
FROM node:18-alpine

# Crea el directorio de la aplicación
WORKDIR /app

# Copia el package.json y el yarn.lock
COPY package.json yarn.lock ./

# Instala las dependencias
RUN yarn install

# Copia el resto del código de la aplicación
COPY . .

# Compila la aplicación
RUN yarn build

# Expone el puerto en el que corre NestJS (por defecto, el puerto 3000)
EXPOSE 3002

# Comando para iniciar la aplicación
CMD ["yarn", "start:prod"]