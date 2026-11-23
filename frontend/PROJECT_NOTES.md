# Notas para documentar la segunda entrega

## Inventario de pantallas
1. Ingreso: marca Rushbound, nombre de usuario, contraseña, validaciones y botón de acceso.
2. Menú principal: saludo del usuario, botón Jugar, botón Comentarios y cerrar sesión.
3. Comentarios: formulario, contador de caracteres, validación, listado de comentarios y estado vacío.
4. Juego: WebView que carga el build WebGL de Unity y opción de volver al menú.

## Requerimientos funcionales iniciales
- RF-01: validar que el usuario tenga al menos 3 caracteres.
- RF-02: validar que la contraseña tenga al menos 4 caracteres.
- RF-03: navegar del ingreso al menú principal.
- RF-04: abrir la pantalla de juego desde el menú.
- RF-05: cargar el build WebGL de Unity en un WebView.
- RF-06: abrir la pantalla de comentarios desde el menú.
- RF-07: validar comentarios de 3 a 500 caracteres.
- RF-08: mostrar comentarios publicados en una lista.
- RF-09: conservar localmente el usuario y los comentarios al cerrar y volver a abrir la app.
- RF-10: permitir regresar al menú desde comentarios y juego.

## Requerimientos no funcionales iniciales
- RNF-01: interfaz adaptada a pantallas móviles.
- RNF-02: contraste suficiente y textos legibles.
- RNF-03: componentes visuales reutilizables.
- RNF-04: separar pantallas, componentes y tema.
- RNF-05: no almacenar contraseñas en el dispositivo.
- RNF-06: mostrar un mensaje de error si Unity no carga.

## Arquitectura
App.js mantiene el estado de navegación y persistencia local. `src/screens` contiene las cuatro pantallas; `src/components` agrupa componentes compartidos; `src/theme` define los colores. `UnityScreen` muestra el build WebGL en `react-native-webview`. `AsyncStorage` se usa temporalmente para conservar usuario y comentarios hasta la integración del backend.

## Nota de implementación
Los wireframes y mockups deben documentarse como diseño propuesto, mientras que las capturas de evidencia deben tomarse de una ejecución real en Expo Go/emulador. No afirmar que se ha conectado un backend: esta versión es local.

## Diseño visual (actualizado)
Estilo pixel art de playa, siguiendo los mockups: cielo en franjas, mar, espuma, arena, palmeras, rocas y plantas dibujadas como pixel art con `react-native-svg` (`src/components/sprites.js` y `PixelArt.js`). El logo usa la fuente Press Start 2P con contorno y relieve (`PixelTitle.js`). Los botones, paneles, campos y la barra superior están en `src/components/UI.js` y la paleta en `src/theme/colors.js`. La lógica de las pantallas no cambió.
