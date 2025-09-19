# Usar imagen base oficial de Node.js
FROM node:18-alpine
# Establecer directorio de trabajo
WORKDIR /app
# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]