# Instrucciones del Proyecto (TICTOC KOREA)

Este documento describe la estructura del proyecto y los pasos necesarios para que cualquier miembro del equipo pueda configurar, instalar y ejecutar el entorno de desarrollo localmente con nuestra base de datos.

---

## 📁 Estructura del Proyecto

El proyecto está organizado de manera limpia en la raíz `Proyecto-Evaluacion-Final/`:

```text
Proyecto-Evaluacion-Final/
├── docker-compose.yml       # Configuración de Docker (PostgreSQL y pgAdmin)
├── db_final.sql            # Script SQL de inicialización de la base de datos (TICTOC)
├── consultas.md            # Consultas SQL del proyecto resueltas
├── Instrucciones.md        # Esta guía de documentación y configuración
├── script_db.md            # Documentación de la base de datos
├── testdb.md               # Script de pruebas de la base de datos
├── nn                      # Archivo script auxiliar
├── pgadmin/                # Configuración preestablecida de pgAdmin
│   ├── pgadmin_pass        # Contraseña guardada para conexión automática
│   └── pgadmin_servers.json # Servidor PostgreSQL preconfigurado
└── tictoc_api/             # API REST del proyecto (Node.js + Express)
    ├── .env                # Variables de entorno locales
    ├── .env copy           # Plantilla para variables de entorno
    ├── package.json        # Definición de scripts y dependencias
    ├── package-lock.json   # Historial de dependencias de npm
    └── src/                # Código fuente de la API
        ├── app.js          # Punto de entrada de Express
        ├── db.js           # Pool de conexión a PostgreSQL
        ├── controllers/    # Lógica de los endpoints
        └── routes/         # Rutas de la API
```

---

## 🛠️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu máquina:
- **Node.js** (versión 18 o superior recomendada)
- **Docker Compose** (para levantar la base de datos y pgAdmin)
- **Git**

---

## 🚀 Configuración Inicial

### 1. Clonar el repositorio
Clona este repositorio en tu máquina local:
```bash
git clone https://github.com/sashasafont/Proyecto-Evaluacion-Final.git
cd Proyecto-Evaluacion-Final
```

### 2. Configurar Variables de Entorno
En la carpeta del API (`tictoc_api`), crea un archivo llamado `.env`:
```bash
# Entra al directorio del API
cd tictoc_api

# Copia el archivo de ejemplo
cp ".env copy" .env
```
Y asegúrate de que tenga los siguientes valores configurados:
```env
DB_HOST=localhost
DB_PORT=5435
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=123456
```
*Nota: Modifica los valores dentro de `.env` según tu configuración local de base de datos.*

### 3. Instalar Dependencias de Node.js
Las dependencias necesarias (como Express, PG, Nodemon, etc.) **no se suben al repositorio** (están excluidas en `.gitignore`). Debes instalarlas localmente:
```bash
# Dentro de tictoc_api
npm install
```

---

## 🐳 Levantar la Base de Datos con Docker

Hemos eliminado todos los archivos antiguos de la base de datos *Pagila* para reemplazarlos completamente con nuestro esquema y datos de **db_final.sql**:

1. Ve a la carpeta raíz que contiene el archivo `docker-compose.yml`:
   ```bash
   # Si estás en tictoc_api, vuelve a la raíz:
   cd ..
   ```
2. Inicia los contenedores en segundo plano:
   ```bash
   docker-compose up -d
   ```
   *Esto inicializará PostgreSQL y cargará automáticamente nuestro script `db_final.sql`.*

3. Acceder a pgAdmin:
   - URL: [http://localhost:5051](http://localhost:5051)
   - Usuario: `admin@admin.com`
   - Contraseña: `root`
   - Contraseña del servidor PostgreSQL: `123456`

---

## ⚡ Ejecutar el Servidor API (Node.js)

Para iniciar el servidor de desarrollo con recarga automática (Nodemon):
```bash
cd tictoc_api
npm run dev
```
El servidor se iniciará en el puerto `3000`.

---

## 📡 Endpoints del API

Hemos reestructurado por completo la API para que interactúe con nuestra base de datos final. Ahora los endpoints disponibles son:

### 👤 Usuarios (`/api/usuarios`)
- `GET /api/usuarios` - Lista todos los usuarios.
- `GET /api/usuarios/:id` - Obtiene un usuario específico.
- `POST /api/usuarios` - Crea un nuevo usuario.
- `PUT /api/usuarios/:id` - Modifica los datos de un usuario.
- `DELETE /api/usuarios/:id` - Elimina un usuario.

### 📺 Canales (`/api/canales`)
- `GET /api/canales` - Lista todos los canales.
- `GET /api/canales/:id` - Obtiene un canal por ID.
- `POST /api/canales` - Crea un canal.
- `PUT /api/canales/:id` - Modifica un canal.
- `DELETE /api/canales/:id` - Elimina un canal.

### 🔴 Transmisiones (`/api/lives`)
- `GET /api/lives` - Lista todas las emisiones en vivo y finalizadas.
- `GET /api/lives/:id` - Obtiene detalles de un live específico.
- `POST /api/lives` - Registra un nuevo live.
- `PUT /api/lives/:id` - Actualiza el estado o título del live.
- `DELETE /api/lives/:id` - Elimina el registro de un live.

### 📊 Consultas y Evaluaciones (`/api/consultas`)
Estos endpoints resuelven directamente las consultas planteadas en el archivo `consultas.md`:
1. `GET /api/consultas/bloqueados/:id` - Usuarios bloqueados por el usuario `:id`.
2. `GET /api/consultas/seguidores/:id` - Cantidad de seguidores que tiene el canal del usuario `:id`.
3. `GET /api/consultas/billetera/:id` - Comprueba el saldo en la billetera del usuario `:id`.
4. `GET /api/consultas/coleccion/:id` - Ítems comprados por el usuario `:id`.
5. `GET /api/consultas/chats-privados/:id` - Consulta los mensajes de chat privado del usuario `:id`.
6. `GET /api/consultas/chat-live/:id` - Obtiene los detalles del usuario que mandó un mensaje específico `:id` en el chat en vivo.
7. `GET /api/consultas/live-status/:id` - Comprueba si un canal `:id` está transmitiendo en vivo o no.
8. `GET /api/consultas/live-content/:id` - Consulta el tipo de contenido que está transmitiendo la emisión `:id`.
9. `GET /api/consultas/notificaciones/:id` - Lista y verifica las notificaciones del usuario `:id`.
10. `GET /api/consultas/reportes/:id` - Consulta el estado de los reportes realizados por el usuario `:id`.

---

## 📁 Archivos Clave y Avance del Proyecto

Hemos estado trabajando en los siguientes archivos clave que se encuentran en la raíz:

- **[db_final.sql](file:///c:/Users/Dar/Desktop/PyTictoc/Proyecto-Evaluacion-Final/db_final.sql)**: Contiene el script de creación del esquema de la base de datos final del proyecto junto con la inserción de datos de prueba (usuarios, canales, seguidores, bloqueados, etc.).
- **[consultas.md](file:///c:/Users/Dar/Desktop/PyTictoc/Proyecto-Evaluacion-Final/consultas.md)**: Contiene las consultas SQL planteadas para el proyecto.
