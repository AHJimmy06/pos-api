# 1. Usamos una imagen ligera de Node.js para producción
FROM node:18-alpine

# 2. Directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos los archivos de dependencias primero (aprovecha la caché de Docker)
COPY package*.json ./

# 4. Instalamos las dependencias del proyecto
RUN npm install

# 5. Copiamos todo el código fuente del backend
COPY . .

# 6. ¡CRUCIAL PARA PRISMA! Generamos el cliente para la arquitectura Linux del contenedor
RUN npx prisma generate



# 7. Compilamos el código de TypeScript a JavaScript ejecutable
RUN npm run build

# 8. Informamos el puerto que usará el contenedor (NestJS usa el 3000 por defecto)
EXPOSE 3000

# 9. Comando de arranque en producción: Sincroniza el esquema con Supabase y levanta la API
CMD ["sh", "-x", "-c", "npx prisma db push && npm run start:prod"]