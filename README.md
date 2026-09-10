# Día del Profesor — Instituto Amanecer 🎓 (versión HTML/CSS/JS puro)

Misma aplicación que la versión anterior (React), pero reescrita en
**HTML, CSS y JavaScript puro**, sin ningún paso de instalación ni de
"build". Esto significa:

- No hace falta instalar Node.js ni ejecutar `npm install`.
- No hay riesgo de errores de compilación al publicarla.
- Se puede abrir directamente en el navegador o subir a cualquier
  servicio de archivos estáticos (GitHub Pages, Netlify, Vercel, o
  incluso un simple hosting compartido).

La sincronización en tiempo real entre el panel de admin y la pantalla
pública se sigue haciendo con **Firebase Firestore**, pero ahora se
conecta directamente desde el navegador con `<script type="module">`,
sin ningún paso previo.

---

## 1. Qué es esta aplicación

| Página | Para qué sirve | Quién la usa |
|---|---|---|
| `publico.html` | Se proyecta para todo el público | Nadie la toca, solo se mira |
| `admin.html` | Controla todo lo que pasa en la pantalla pública | Los alumnos organizadores |
| `unirse.html` (opcional) | Segunda pantalla informativa por celular | Público general |
| `index.html` | Menú con enlaces a las tres anteriores | Cualquiera |

---

## 2. Cómo configurarla (una sola vez, antes del evento)

### Paso 1 — Crear el proyecto de Firebase

1. Entrá a [https://console.firebase.google.com](https://console.firebase.google.com)
   e iniciá sesión con una cuenta de Google.
2. "Crear un proyecto" → nombre sugerido: `dia-profesor-amanecer`. Podés
   desactivar Google Analytics.
3. En el menú lateral: "Compilación" → "Firestore Database" → "Crear base
   de datos". Elegí modo de producción y cualquier ubicación (por ejemplo
   `southamerica-east1`).
4. Dentro de Firestore, pestaña "Reglas": pegá el contenido del archivo
   `firestore.rules` de este proyecto, y publicá.
5. Volvé a la pantalla principal del proyecto (ícono de la casita) → ícono
   **"</>"** ("Agregar app web") → ponele un nombre (ej: "app-evento") →
   crear. Firebase te va a mostrar un bloque de código con valores como
   `apiKey`, `authDomain`, etc.

### Paso 2 — Cargar esos datos en el proyecto

Abrí el archivo `js/firebase-config.js` con cualquier editor de texto
(o directamente en GitHub, con el lápiz de "editar") y reemplazá los
valores de ejemplo por los tuyos:

```js
export const firebaseConfig = {
  apiKey: "AIzaSyD-xxxxxxxxxxxxxxxx",
  authDomain: "dia-profesor-amanecer.firebaseapp.com",
  projectId: "dia-profesor-amanecer",
  storageBucket: "dia-profesor-amanecer.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcabcabc",
};

export const ADMIN_PASSWORD = "elijan-una-contraseña";
```

> Estos valores de Firebase no son secretos como una contraseña: están
> pensados para viajar dentro del código del navegador. Lo que protege
> la base de datos son las Reglas de Firestore del paso anterior.

---

## 3. Cómo probarla en tu computadora

Los navegadores no permiten abrir archivos `type="module"` con doble
clic (`file://`) por seguridad — hace falta sí o sí un mini-servidor
local. La forma más simple:

**Si tenés Python instalado** (la mayoría de las Mac y Linux lo traen):

```bash
cd dia-profesor-html
python3 -m http.server 8080
```

Y abrí `http://localhost:8080` en el navegador.

**Si usás Visual Studio Code**: instalá la extensión gratuita
"Live Server", clic derecho sobre `index.html` → "Open with Live Server".

**Si no tenés nada de eso instalado**: no hace falta — podés directamente
publicarla en Internet (siguiente punto) y probarla ahí.

---

## 4. Cómo publicarla en Internet

### Opción recomendada: GitHub Pages (gratis, sin configuración)

1. Subí esta carpeta a un repositorio de GitHub (ver la guía que ya te
   pasamos para subir el proyecto a GitHub — es el mismo procedimiento).
2. En el repositorio, andá a **Settings → Pages**.
3. En "Source", elegí la rama `main` y la carpeta `/ (root)`. Guardá.
4. Esperá 1-2 minutos. GitHub te va a mostrar una dirección como:
   `https://tu-usuario.github.io/dia-profesor-amanecer/`
5. Esa es tu dirección pública. Las páginas quedan en:
   - `.../index.html`
   - `.../admin.html`
   - `.../publico.html`
   - `.../unirse.html`

### Alternativas igual de válidas

- **Netlify** (netlify.com): arrastrá la carpeta completa a la web de
  Netlify ("Deploy manually") y listo, sin necesidad de Git siquiera.
- **Vercel**: funciona igual que con la versión anterior, pero acá ni
  siquiera hace falta configurar "Framework Preset" ni variables de
  entorno: al ser HTML puro, Vercel lo sirve tal cual.

Como no hay ningún paso de "build" (compilación), **no debería volver a
pasar lo de la pantalla en blanco** que tuvimos con la versión anterior.

---

## 5. Cómo acceder al panel de administración

Entrá a `TU-DIRECCION/admin.html` e ingresá la contraseña definida en
`js/firebase-config.js` (por defecto: `amanecer2026` si no la cambiaste).

> ⚠️ Es una protección básica para un evento escolar puntual, no un
> sistema de seguridad bancario. No compartas el enlace de `admin.html`
> fuera del grupo organizador.

---

## 6. Cómo configurar cada dinámica

### En una Nota

1. Subí los archivos `.mp3` a la carpeta `audio/` del proyecto (y volvé a
   subir/publicar el sitio si ya lo habías publicado).
2. En `admin.html → En una nota → Agregar canción`, completá título,
   artista, ronda y el **nombre exacto del archivo** (ej: `cancion1.mp3`).

### 100 Amanecidos

En `admin.html → 100 Amanecidos`, completá la pregunta y las 5
respuestas con sus puntajes, "Agregar pregunta". Repetí para cada
pregunta que quieras usar durante el acto.

### 8 Escalones

En `admin.html → 8 Escalones`, cargá cada pregunta con categoría, 4
opciones y cuál es la correcta. El orden de carga es el orden de
aparición (escalón 1, 2, 3...).

Todo esto se guarda en la base de datos: no hace falta tocar código para
agregar o modificar contenido.

---

## 7. Cómo iniciar una partida el día del evento

1. Abrí `publico.html` en la notebook conectada al proyector, pantalla
   completa (`F11`).
2. Abrí `admin.html` en el dispositivo de control, ingresá la contraseña.
3. En "Inicio", elegí qué dinámica mostrar — cambia al instante en la
   pantalla pública.
4. Usá los controles de cada sección para avanzar, revelar respuestas,
   sumar puntos, etc.

---

## 8. Cómo conectar celulares (función opcional)

`unirse.html` es una vista opcional de "segunda pantalla": muestra qué
dinámica está en curso y permite anotarse con nombre y equipo. No es
necesaria para que las dinámicas funcionen. Podés generar un QR con
cualquier generador gratuito (ej. qr-code-generator.com) apuntando a
`TU-DIRECCION/unirse.html`.

---

## 9. Solución de problemas comunes

**La pantalla pública queda en blanco o dice "Conectando..." sin avanzar.**
→ Abrí la consola del navegador (F12 → pestaña "Console") y fijate el
error. Lo más común es no haber completado bien `js/firebase-config.js`
con los datos reales del proyecto de Firebase.

**"Failed to load module script" o error de CORS al abrir con doble clic.**
→ No se puede abrir `index.html` con doble clic directamente desde la
carpeta (protocolo `file://`); hace falta un mini-servidor local (ver
punto 3) o publicarla en Internet.

**Cambio algo en admin.html y no se ve en publico.html.**
→ Verificá que ambas páginas estén usando la misma dirección publicada
(el mismo proyecto de Firebase). Si probaste una en tu compu y otra ya
publicada, no van a sincronizar entre sí.

**Se recargó una página sin querer / se cortó Internet un momento.**
→ No hay problema: todo el estado vive en Firestore. Al reconectar,
vuelve a mostrar todo tal cual estaba.

**Me olvidé la contraseña del panel de admin.**
→ Está en texto plano en `js/firebase-config.js`, buscá la línea
`ADMIN_PASSWORD`.

**Quiero borrar todo y empezar de cero.**
→ `admin.html → Configuración → REINICIAR TODO`.

**El audio de una canción no suena.**
→ Confirmá que el archivo esté en `audio/`, que el nombre coincida
exactamente (mayúsculas incluidas) con el cargado en el panel, y que
hayas vuelto a publicar el sitio después de agregarlo.

---

## 10. Recomendaciones para el día del evento

- Probar la app completa (con las dos pantallas reales) al menos un día
  antes, no el mismo día.
- Cargar todas las canciones, preguntas y opciones con anticipación.
- Tener la contraseña de `admin.html` anotada y a mano.
- Llevar un cargador para la notebook de control.
- Tener un segundo dispositivo con `admin.html` abierto por si el
  principal falla.
- Hacer una prueba de sonido con el sistema de audio de la institución
  antes del acto.

---

## 11. Estructura del proyecto

```
dia-profesor-html/
  index.html          → menú general
  admin.html           → panel de control (contraseña)
  publico.html          → pantalla para el proyector
  unirse.html            → vista opcional por celular
  audio/                   → acá van los .mp3
  css/style.css             → estilos de toda la app
  js/
    firebase-config.js       → tus claves de Firebase + contraseña admin
    seed-data.js               → datos de ejemplo iniciales
    state.js                     → conexión en tiempo real con Firestore
    admin.js                       → lógica del panel de administración
    publico.js                       → lógica de la pantalla pública
    unirse.js                          → lógica de la vista por celular
  firestore.rules                       → reglas de seguridad de la base de datos
  README.md                              → este archivo
```

---

## 12. Pruebas realizadas antes de la entrega

Se verificó que los cinco archivos JavaScript no tengan errores de
sintaxis, y que la lógica de navegación, puntajes, revelado de
respuestas, X de incorrecta, avance/retroceso de escalones,
reproducción de audio, carga de canciones/preguntas y reinicio de
partidas replique exactamente el comportamiento de la versión anterior
en React, ahora sin ningún paso de compilación de por medio.
