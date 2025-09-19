# TP02 Docker - TODO App

Aplicación TODO containerizada con Docker para demostrar el uso de contenedores en entornos QA y PROD.

## 🚀 Descripción

Esta aplicación TODO está desarrollada en Node.js y PostgreSQL, containerizada para funcionar en dos entornos independientes (QA y PROD) usando la misma imagen base pero con diferentes configuraciones.

## 🛠️ Tecnologías

- **Backend**: Node.js con Express
- **Base de datos**: PostgreSQL 13
- **Containerización**: Docker y Docker Compose
- **Orquestación**: Docker Compose con redes y volúmenes

## Requisitos previos

- Docker Desktop instalado
- Cuenta en Docker Hub (para descargar imágenes)
- Puerto 3000 y 3001 libres
- Puertos 5433 y 5434 libres (PostgreSQL)

## Construcción de imágenes

-Clonar el repositorio
git clone [tu-repo-url]
cd tp-docker-2025

-Construir imagen local
 #Construir imagen
	docker build -t sromeror/tp-docker-app:dev .

 # Etiquetar versión estable
	docker tag sromeror/tp-docker-app:dev sromeror/tp-docker-app:v1.0


##Publicar en Docker Hub
docker login
docker push sromeror/tp-docker-app:dev
docker push sromeror/tp-docker-app:v1.0


# 🚀 Ejecución con Docker Compose 
##Levantar todo el entorno
 # Levantar todos los servicios
	docker-compose up -d

 # Verificar que todo esté corriendo
	docker-compose ps

 # Ver logs en tiempo real
	docker-compose logs -f


## Parar el entorno
 # Parar servicios
	docker-compose down

 # Parar y eliminar volúmenes (borra datos)
	docker-compose down -v


#Ejecución manual (alternativa)

##QA Environment
 # PostgreSQL QA
docker run --name postgres-qa \
  	-e POSTGRES_PASSWORD=qapassword \
  	-e POSTGRES_DB=todoapp \
  	-v postgres-qa-data:/var/lib/postgresql/data \
  	-p 5433:5432 \
  	-d postgres:13

 #App QA
docker run --name todoapp-qa \
  	-e DB_HOST=host.docker.internal \
  	-e DB_PORT=5433 \
  	-e DB_PASSWORD=qapassword \
  	-e NODE_ENV=development \
  	-p 3000:3000 \
  	-d sromeror/tp-docker-app:v1.0


## PROD Environment
 # PostgreSQL PROD
docker run --name postgres-prod \
  -e POSTGRES_PASSWORD=prodpassword \
  -e POSTGRES_DB=todoapp \
  -v postgres-prod-data:/var/lib/postgresql/data \
  -p 5434:5432 \
  -d postgres:13

 # App PROD
docker run --name todoapp-prod \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5434 \
  -e DB_PASSWORD=prodpassword \
  -e NODE_ENV=production \
  -p 3001:3000 \
  -d sromeror/tp-docker-app:v1.0


#Acceso a la aplicación

### URLs de acceso
- **QA Environment**: http://localhost:3000
- **PROD Environment**: http://localhost:3001

### Verificación con curl
 # Probar QA
curl http://localhost:3000

 # Probar PROD
curl http://localhost:3001


#Conexión a bases de datos

## PostgreSQL QA
 # Conectarse a BD QA
docker exec -it postgres-qa psql -U postgres -d todoapp

 # O desde host
psql -h localhost -p 5433 -U postgres -d todoapp


## PostgreSQL PROD
 # Conectarse a BD PROD
docker exec -it postgres-prod psql -U postgres -d todoapp

 # O desde host
psql -h localhost -p 5434 -U postgres -d todoapp



#Verificación de funcionamiento
### 1. Verificar contenedores
docker-compose ps

Deberían aparecer 4 servicios en estado "Up"


### 2. Verificar aplicaciones web
- Abrir http://localhost:3000 (debería cargar la TODO app QA)
- Abrir http://localhost:3001 (debería cargar la TODO app PROD)

### 3. Verificar persistencia de datos
 # Agregar una tarea en QA
 # Reiniciar servicios
docker-compose restart

 # Verificar que la tarea sigue ahí


### 4. Verificar bases de datos

 # Ver tablas en QA
docker exec -it postgres-qa psql -U postgres -d todoapp -c "\dt"

 # Ver tablas en PROD
docker exec -it postgres-prod psql -U postgres -d todoapp -c "\dt"

# Ver logs de la aplicación
docker-compose logs todoapp-qa
docker-compose logs todoapp-prod

# Ver logs de PostgreSQL
docker-compose logs postgres-qa
docker-compose logs postgres-prod



### Reiniciar completamente
 # Parar todo y limpiar
docker-compose down -v
docker system prune -f

 # Levantar de nuevo
docker-compose up -d

##Estructura del proyecto
tp-docker-2025/
├── app.js                 # Aplicación Node.js
├── package.json          # Dependencias npm
├── Dockerfile            # Imagen de la aplicación
├── docker-compose.yml    # Orquestación de servicios
├── README.md            # Este archivo
└── decisiones.md        # Documentación de decisiones técnicas

##Versionado de imágenes

- `sromeror/tp-docker-app:dev` - Versión de desarrollo
- `sromeror/tp-docker-app:v1.0` - Versión estable para producción

##Autor

Desarrollado por Santos Romero Reyna y Marcos Lopez como parte del TP02 de Docker - 2025