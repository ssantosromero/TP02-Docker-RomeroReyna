# Decisiones de Desarrollo - TP02 Docker

## 1. Configuración del Entorno y Elección de Aplicación

1) Entre al desktop y cree la carpeta del proyecto:
```bash
cd Desktop
mkdir tp-docker-2025
cd tp-docker-2025
git init

2)Decidí crear una aplicación TODO con Node.js porque:


Ya tengo Docker funcionando de las prácticas anteriores
Node.js maneja muy bien las variables de entorno que necesito para QA y PROD
Se conecta fácil con PostgreSQL que ya probé en clase
Es más directo que .NET para este TP


3)Arme el package.json con las dependencias que necesitaba:
cat > package.json << 'EOF'
{
  "name": "tp-docker-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3"
  }
}
EOF

4)Programe la aplicación en app.js con:
mate app.js

5)Cree el Dockerfile:
mate Dockerfile
Imagen base elegida: node:18-alpine

####Por qué elegí esta imagen:

Oficial y mantenida por el equipo de Node.js
Alpine es más liviana (50MB vs 300MB de ubuntu)
Node.js 18 es LTS (estable)
Ya la use en prácticas anteriores

6)Estructura del Dockerfile paso a paso:
FROM node:18-alpine (imagen base)
WORKDIR /app (directorio de trabajo)
COPY package*.json (copio dependencias primero)
RUN npm install (instalo dependencias)
COPY . . (copio código fuente)
EXPOSE 3000 (expongo puerto)
CMD ["npm", "start"](comando para iniciar)

Crea las imagenes 
Por qué esta estructura: Copio package.json primero para aprovechar el cache de Docker cuando solo cambio código, no dependencias.

## 3. Publicación en Docker Hub
6) Primero me autentiqué en Docker Hub:
docker login

7)Tuve que crear el repositorio tp-docker-app en Docker Hub manualmente. Mi usuario de Docker Hub es sromeror

8)Publiqué la imagen:

#####Re-etiqueté con mi usuario correcto
docker tag ssantosromero/tp-docker-app:dev sromeror/tp-docker-app:dev

#####Subí la imagen
docker push sromeror/tp-docker-app:dev


## 4.Configuración de Entorno PROD

9)Creé el entorno de producción con PostgreSQL independiente:

bash# PostgreSQL para PROD en puerto 5434
docker run --name postgres-prod \
  -e POSTGRES_PASSWORD=prodpassword \
  -e POSTGRES_DB=todoapp \
  -v postgres-prod-data:/var/lib/postgresql/data \
  -p 5434:5432 \
  -d postgres:13

#### App en PROD en puerto 3001

bash# App en PROD en puerto 3001
docker run --name todoapp-prod \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5434 \
  -e DB_PASSWORD=prodpassword \
  -e NODE_ENV=production \
  -p 3001:3000 \
  -d sromeror/tp-docker-app:dev
  
  
  **Resultado:** Ambos entornos funcionando simultáneamente:
  - QA: http://localhost:3000 (BD en puerto 5433)
  - PROD: http://localhost:3001 (BD en puerto 5434)

  **Evidencia de funcionamiento:**
  - Aplicación web carga correctamente en ambos puertos
  - Contenedores corriendo sin errores
  - Bases de datos independientes con volúmenes persistentes


##5. Creación de Versión Estable
  10) Creé tag v1.0 para versión estable:
  
  -Etiqueté la imagen como versión estable
  docker tag sromeror/tp-docker-app:dev sromeror/tp-docker-app:v1.0
  docker push sromeror/tp-docker-app:v1.0
  
  
##6. Docker Compose para Entorno Reproducible

  **¿Por qué usar Docker Compose?**
  Hasta ahora estaba corriendo contenedores individuales con `docker run`, lo cual tiene varios problemas:
  - Comandos largos y complejos para cada contenedor
  - Difícil de recordar todas las configuraciones
  - No hay orquestación entre servicios (apps y BD)
  - Imposible de reproducir fácilmente en otra máquina
  - Gestión manual de redes y volúmenes

  **Función de Docker Compose:**
  Docker Compose me permite definir toda la infraestructura como código en un archivo YAML. Con un solo comando (`docker-compose up`) levanto:
  - Múltiples contenedores coordinados
  - Redes para aislar QA de PROD
  - Volúmenes para persistencia
  - Variables de entorno organizadas
  - Dependencias entre servicios (app espera a BD)

  11) Creé docker-compose.yml para orquestar todos los servicios:

  **Servicios configurados:**
  - `postgres-qa`: BD para QA (puerto 5433)
  - `postgres-prod`: BD para PROD (puerto 5434) 
  - `todoapp-qa`: App en modo development (puerto 3000)
  - `todoapp-prod`: App en modo production (puerto 3001)

  12) Limpié contenedores anteriores y levanté con compose:

	# Paré contenedores manuales
docker stop todoapp-qa todoapp-prod postgres-qa postgres-prod
docker rm todoapp-qa todoapp-prod postgres-qa postgres-prod

	# Levanté con compose
docker-compose up -d

**Verificación final:**

curl http://localhost:3000 -->QA:Funcionando
curl http://localhost:3001 -->PROD:Funcionando
docker-compose ps          -->4 servicios UP
