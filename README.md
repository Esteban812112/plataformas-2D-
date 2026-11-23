# Rushbound

Videojuego de plataformas 2D para dispositivos móviles, con una aplicación móvil que gestiona las cuentas de usuario y el progreso del jugador.

Proyecto de la asignatura **Aplicaciones Móviles** — Facultad de Matemáticas e Ingenierías, Konrad Lorenz Fundación Universitaria. Bogotá D.C., 2026.

## Contenido

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos](#requisitos)
- [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
- [Pruebas](#pruebas)
- [Seguridad](#seguridad)
- [Equipo](#equipo)

## Descripción

Rushbound es un juego de plataformas 2D centrado en el movimiento rápido y preciso, con niveles cortos de dificultad progresiva, checkpoints y enfrentamientos contra jefes. El proyecto tiene tres partes:

| Parte | Tecnología | Qué hace |
|---|---|---|
| **Juego** | Unity (exportado a WebGL) | El gameplay: movimiento, niveles, enemigos y checkpoints. |
| **Frontend** | React Native + Expo | La app: ingreso y registro, menú principal, comentarios y la pantalla donde se ejecuta el juego. |
| **Backend** | Kotlin + Ktor | La API: registra usuarios, valida el ingreso y guarda el nivel desbloqueado. |

### Qué guarda el backend

Por cada usuario: nombre de usuario, correo, contraseña (almacenada con hash, nunca en texto plano) y un número del **1 al 10** con el nivel que tiene desbloqueado.

## Arquitectura

```
Unity (WebGL)  ──mensaje──►  React Native (Expo)  ──HTTP / JSON──►  Ktor (API)  ──►  Base de datos
   el juego                      la aplicación                       el servidor        usuarios y nivel
```

- El **juego no habla directamente con el backend**: se ejecuta dentro de la app y le avisa cuando el jugador desbloquea un nivel; la app es la que guarda ese progreso llamando a la API.
- El **backend** está organizado en capas: rutas → servicios → repositorios → base de datos. Las rutas solo reciben y responden, las reglas de negocio viven en los servicios y el acceso a datos en los repositorios.
- La sesión se maneja con **JWT**: al ingresar, el servidor devuelve un token que la app envía en cada petición protegida.

## Estructura del repositorio

```
plataformas-2D-/
├── backend/             # API en Kotlin + Ktor
│   ├── src/main/kotlin/com/rushbound/
│   │   ├── config/      # configuración: CORS, seguridad, base de datos, serialización, errores
│   │   ├── routes/      # endpoints (autenticación y usuario)
│   │   ├── service/     # reglas de negocio
│   │   ├── repository/  # acceso a la base de datos
│   │   ├── model/       # tablas y entidades
│   │   ├── dto/         # objetos de petición y respuesta
│   │   └── utils/       # JWT, hash de contraseñas, validaciones, política de niveles
│   ├── src/test/        # pruebas automáticas
│   ├── docker-compose.yml
│   └── README.md        # detalle del backend
├── frontend/            # App móvil en React Native (Expo)
│   ├── App.js
│   ├── src/
│   │   ├── api.js       # comunicación con el backend
│   │   ├── screens/     # Login, Home, Comments, Unity
│   │   ├── components/  # botones, campos, fondo de playa, título pixel art
│   │   └── theme/       # colores
│   └── PROJECT_NOTES.md # notas de diseño y decisiones del frontend
└── README.md
```

> El build del juego (`frontend/assets/unity-webgl/`) **no está en el repositorio** porque pesa mucho y se regenera desde Unity. Ver [Generar el build del juego](#3-generar-el-build-del-juego).

## Requisitos

| Herramienta | Para qué |
|---|---|
| [Git](https://git-scm.com/) | Clonar el repositorio |
| [Node.js](https://nodejs.org/) (LTS) y npm | Frontend |
| Expo Go (en el celular) o un emulador de Android Studio | Ver la app |
| JDK 17 o 21 | Backend |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Base de datos local |
| Unity (la versión del proyecto) | Solo si vas a regenerar el juego |

## Cómo ejecutar el proyecto

### 0. Clonar

```bash
git clone https://github.com/Esteban812112/plataformas-2D-.git
cd plataformas-2D-
```

### 1. Backend

```bash
cd backend
docker compose up -d        # levanta la base de datos
./gradlew run               # en Windows PowerShell: .\gradlew.bat run
```

Las variables de entorno disponibles están en `backend/.env.example`. Copia ese archivo a `backend/.env` si necesitas cambiar algún valor (el archivo `.env` real no se sube al repositorio). El detalle de endpoints y configuración está en [`backend/README.md`](backend/README.md).

### 2. Frontend

```bash
cd frontend
npm install
npx expo start
```

- **Celular:** escanea el código QR con Expo Go. El celular y el computador deben estar en la misma red Wi-Fi.
- **Emulador de Android:** presiona `a` en la terminal.
- **Navegador:** `npx expo start --web`.

La dirección del backend se configura en `frontend/src/api.js`. Desde el emulador de Android, el computador se ve como `10.0.2.2`. Desde un celular físico hay que usar la IP local del computador (por ejemplo `192.168.x.x`) y permitir el puerto del backend en el firewall.

### 3. Generar el build del juego

1. En Unity: **File → Build Settings → WebGL → Build**.
2. Exporta el resultado a `frontend/assets/unity-webgl/`.
3. Ese contenido se sirve como sitio estático para que la pantalla "Jugar" lo cargue. Los detalles de cómo servirlo están en [`frontend/PROJECT_NOTES.md`](frontend/PROJECT_NOTES.md).

## Pruebas

```bash
cd backend
./gradlew test              # en Windows PowerShell: .\gradlew.bat test
```

Algunas pruebas de integración pueden necesitar Docker en ejecución.

## Seguridad

- Las contraseñas se guardan con hash.
- Las claves, contraseñas reales y direcciones privadas van en variables de entorno o en un archivo `.env`, que está excluido del repositorio con `.gitignore`. Nunca subas secretos reales.
- El servidor es quien valida que el nivel esté entre 1 y 10; la app no decide el progreso por su cuenta.

## Equipo

| Integrante | Rol |
|---|---|
| Juan Esteban Pinzón Preciado | _(por completar)_ |
| _(nombre del integrante 2)_ | _(por completar)_ |
| _(nombre del integrante 3)_ | _(por completar)_ |

## Estado del proyecto

- [x] Frontend en React Native con navegación e integración del juego
- [x] Backend en Ktor con registro, ingreso y guardado del nivel
- [x] Juego en Unity exportado a WebGL
- [ ] Más niveles, mundos y jefes
- [ ] Modo cooperativo para dos jugadores _(fuera del alcance de la versión actual)_
