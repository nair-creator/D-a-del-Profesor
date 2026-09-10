# Día del Profesor — Instituto Amanecer 🎓

Aplicación web para controlar en vivo las tres dinámicas del acto del Día del
Profesor (17/09/2026): **En una Nota**, **100 Amanecidos** y **8 Escalones**.

Pensada para que la maneje un alumno organizador desde una notebook, mientras
otra pantalla (el proyector) muestra el contenido al público, todo
sincronizado en tiempo real.

---

## 1. Qué es esta aplicación

Es una única aplicación web con **tres partes**:

| Parte | Dirección (URL) | Para qué sirve | Quién la usa |
|---|---|---|---|
| Pantalla pública | `/publico` | Se proyecta para todo el público | Nadie la toca, solo se mira |
| Panel de administración | `/admin` | Controla todo lo que pasa en la pantalla pública | Los alumnos organizadores |
| Ingreso de participantes (opcional) | `/unirse` | Segunda pantalla informativa por celular | Público general, opcional |

Todo se sincroniza en tiempo real a través de Internet: lo que se toca en
`/admin` aparece al instante en `/publico`, sin importar si están en la misma
notebook o en dispositivos distintos.

---

## 2. Tecnologías utilizadas

- **React + Vite**: interfaz de usuario.
- **Firebase Firestore**: base de datos en tiempo real que sincroniza el panel
  de administración con la pantalla pública, y que guarda automáticamente el
  progreso (puntajes, pregunta actual, etc.) para que sobreviva a recargas de
  página o reinicios de la notebook.
- **CSS puro**: sin librerías pesadas de diseño.

Se eligió Firebase (y no un servidor propio con WebSockets) porque no
requiere que ustedes administren un servidor el día del evento: es un
servicio de Google que funciona solo, es gratuito para este uso, y guarda el
estado automáticamente ante cortes de conexión.

---

## 3. Cómo instalarla (antes del evento, con tiempo)

### Requisitos

- Tener instalado **Node.js** (versión 18 o superior). Se descarga gratis
  desde [nodejs.org](https://nodejs.org) — instalador normal, "Next, Next,
  Finish".
- Una cuenta de Google (para crear el proyecto gratuito de Firebase).

### Paso 1 — Descomprimir el proyecto

Descomprimí la carpeta `dia-profesor` en cualquier ubicación de la
computadora (por ejemplo, el Escritorio).

### Paso 2 — Instalar dependencias

Abrí una terminal / símbolo del sistema **dentro de la carpeta del
proyecto** (en Windows: clic derecho dentro de la carpeta → "Abrir en
Terminal") y ejecutá:

```bash
npm install
```

Esto descarga automáticamente todo lo necesario. Puede tardar 1-3 minutos.

### Paso 3 — Configurar Firebase (una sola vez)

1. Entrá a [https://console.firebase.google.com](https://console.firebase.google.com)
   e iniciá sesión con una cuenta de Google.
2. Hacé clic en **"Crear un proyecto"**. Nombre sugerido: `dia-profesor-amanecer`.
   Podés desactivar Google Analytics (no hace falta).
3. Una vez creado el proyecto, en el menú lateral entrá a **"Compilación" →
   "Firestore Database"** y hacé clic en **"Crear base de datos"**. Elegí
   modo de producción y cualquier ubicación (por ejemplo `southamerica-east1`).
4. Andá a **"Reglas"** dentro de Firestore y pegá el contenido del archivo
   `firestore.rules` que viene en este proyecto. Guardá / publicá.
5. Volvé a la pantalla principal del proyecto (ícono de la casita) y hacé
   clic en el ícono **"</>"** ("Agregar app web"). Ponele un nombre
   (ej: "app-evento") y creala. Firebase te va a mostrar un bloque de código
   con valores como `apiKey`, `authDomain`, etc.
6. En la carpeta del proyecto, copiá el archivo `.env.example` y renombralo a
   `.env`. Completá cada línea con los valores que te dio Firebase. Ejemplo:

   ```
   VITE_FIREBASE_API_KEY=AIzaSyD-xxxxxxxxxxxxxxxx
   VITE_FIREBASE_AUTH_DOMAIN=dia-profesor-amanecer.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=dia-profesor-amanecer
   VITE_FIREBASE_STORAGE_BUCKET=dia-profesor-amanecer.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcabcabc
   VITE_ADMIN_PASSWORD=elijan-una-contraseña
   ```

Con esto, la app ya sabe a qué base de datos conectarse.

---

## 4. Cómo ejecutarla (modo de prueba, en la propia computadora)

Dentro de la carpeta del proyecto:

```bash
npm run dev
```

Va a aparecer una dirección tipo `http://localhost:5173`. Abrila en el
navegador. Desde ahí podés entrar a `/admin` y `/publico`.

Para probar la sincronización real (dos pantallas distintas), es mejor
publicarla en Internet (ver punto 5) en lugar de usar `localhost`, porque
`localhost` solo funciona en la misma computadora.

---

## 5. Cómo publicarla en Internet (recomendado para el día del acto)

La forma más simple y gratuita es **Vercel**:

1. Entrá a [vercel.com](https://vercel.com) y creá una cuenta gratis (podés
   usar tu cuenta de GitHub o de Google).
2. Subí la carpeta del proyecto a un repositorio de GitHub (o usá la opción
   de Vercel de arrastrar la carpeta directamente, "Deploy sin Git").
3. En Vercel, "Add New Project", elegí el repositorio.
4. En "Environment Variables", cargá las mismas variables que pusiste en tu
   archivo `.env` (las de Firebase + `VITE_ADMIN_PASSWORD`).
5. Hacé clic en "Deploy". En 1-2 minutos vas a tener una dirección pública
   como `https://dia-profesor-amanecer.vercel.app`.

Esa dirección es la que van a usar el día del evento: `.../publico` en la
notebook conectada al proyector, y `.../admin` en la notebook de control.

**Alternativa igual de válida:** Netlify (netlify.com), el proceso es
prácticamente idéntico.

---

## 6. Cómo acceder al panel de administración

1. Entrá a `TU-DIRECCION/admin`.
2. Ingresá la contraseña que configuraste en `VITE_ADMIN_PASSWORD`
   (por defecto, si no la cambiaste: `amanecer2026`).
3. Vas a ver un menú lateral: Inicio, En una nota, 100 Amanecidos,
   8 Escalones, Puntajes, Configuración.

> ⚠️ Esta contraseña es una protección básica pensada para un evento
> escolar puntual, no un sistema de seguridad bancario. No compartas el
> enlace de `/admin` fuera del grupo organizador.

---

## 7. Cómo configurar cada dinámica (antes del evento)

### En una Nota

1. Copiá los archivos de audio (`.mp3`) dentro de la carpeta
   `public/audio/` del proyecto (ver el archivo de instrucciones que ya
   está ahí).
2. Si publicaste la app en Vercel/Netlify, tenés que volver a subir el
   proyecto (o hacer un nuevo "deploy") después de agregar los audios,
   para que queden disponibles en Internet.
3. En `/admin → En una nota`, completá el formulario "Agregar canción" con
   el título, artista, número de ronda, y el **nombre exacto del archivo**
   (ej: `cancion1.mp3`).

### 100 Amanecidos

En `/admin → 100 Amanecidos`, completá la pregunta y las 5 respuestas con
sus puntajes, y hacé clic en "Agregar pregunta". Podés cargar todas las
preguntas que quieras antes del acto.

### 8 Escalones

En `/admin → 8 Escalones`, cargá cada pregunta con su categoría, las 4
opciones, y marcá cuál es la correcta. El orden en que las cargues es el
orden en que van a aparecer (escalón 1, 2, 3...).

Todo esto se guarda automáticamente en la base de datos: **no hace falta
tocar ni una línea de código** para agregar o modificar contenido.

---

## 8. Cómo iniciar una partida el día del evento

1. Abrí `/publico` en la notebook conectada al proyector (pantalla
   completa: `F11` en la mayoría de los navegadores).
2. Abrí `/admin` en la notebook o celular de control, ingresá la contraseña.
3. En "Inicio", elegí qué dinámica mostrar (esto cambia lo que ve el
   público al instante).
4. Usá los controles de cada sección para avanzar preguntas, revelar
   respuestas, sumar puntos, etc.

---

## 9. Cómo conectar la pantalla pública al proyector

Es un navegador web más: conectá la notebook al proyector como harían con
cualquier presentación (cable HDMI o similar), abrí el navegador en esa
notebook, entrá a `/publico`, y poné el navegador en pantalla completa
(`F11`).

---

## 10. Cómo conectar celulares (función opcional)

La app incluye una vista `/unirse` pensada como "segunda pantalla": muestra
qué dinámica está en curso y permite anotarse con nombre y equipo, a modo
de complemento. **No es necesaria para que las dinámicas funcionen.**

Si quieren generar un código QR que lleve directo a esa dirección, pueden
usar cualquier generador de QR gratuito online (ej. qr-code-generator.com)
pegando la URL `TU-DIRECCION/unirse`.

> Evaluamos implementar que los participantes respondan preguntas desde el
> celular (como un Kahoot), pero decidimos no incluirlo en esta primera
> versión: la dinámica "En una nota" depende de campanitas físicas, y las
> otras dos dinámicas son de participación en el escenario, no de trivia
> masiva. Agregarlo habría sumado mucha complejidad técnica para un
> beneficio bajo en este formato de evento puntual.

---

## 11. Solución de problemas comunes

**La pantalla pública dice "Conectando con el panel de control..." y no
avanza.**
→ Revisá la conexión a Internet de esa notebook. También verificá que las
variables de Firebase en `.env` (o en Vercel) sean correctas.

**Cambio algo en el panel de admin y no se ve en la pantalla pública.**
→ Verificá que ambas pantallas estén usando la misma dirección de Internet
(el mismo proyecto de Firebase). Si probaste en `localhost` en una y en la
dirección pública en otra, no van a sincronizar entre sí.

**Se recargó la página del admin o de la pantalla pública sin querer.**
→ No hay problema: todo el estado (puntajes, pregunta actual, etc.) está
guardado en la base de datos. Al recargar, la app vuelve a conectarse y
muestra todo tal cual estaba.

**Se cortó la conexión a Internet unos segundos.**
→ La app se reconecta sola apenas vuelve la señal. Los datos no se pierden.

**Me olvidé la contraseña del panel de admin.**
→ Está guardada en la variable `VITE_ADMIN_PASSWORD` (en el archivo `.env`
local, o en las variables de entorno de Vercel/Netlify si la publicaron
ahí).

**Quiero borrar todo y empezar de cero.**
→ En `/admin → Configuración → REINICIAR TODO`. Ojo: esto borra puntajes,
preguntas y canciones cargadas.

**El audio de una canción no suena.**
→ Confirmá que el archivo esté efectivamente en `public/audio/`, que el
nombre coincida exactamente (mayúsculas/minúsculas incluidas) con el que
cargaste en el panel de admin, y que hayas vuelto a publicar la app
(deploy) después de agregar el archivo.

---

## 12. Recomendaciones para el día del evento

- Probar la app completa (con las dos pantallas reales) **al menos un día
  antes**, no el mismo día.
- Cargar todas las canciones, preguntas y opciones **con anticipación**.
- Tener la contraseña de `/admin` anotada y a mano.
- Llevar un cargador para la notebook de control.
- Como respaldo, tener un segundo dispositivo (celular) con `/admin`
  abierto por si la notebook de control falla.
- Hacer una prueba de sonido con el sistema de audio de la institución
  antes del acto.

---

## 13. Estructura del proyecto

```
dia-profesor/
  public/
    audio/              → acá van los .mp3 de "En una nota"
  src/
    components/         → controles de admin y vistas públicas de cada juego
    pages/
      Home.jsx           → menú general (no se proyecta)
      Admin.jsx           → panel de control (protegido por contraseña)
      Public.jsx          → pantalla pública para el proyector
      Join.jsx            → vista opcional para celulares
    data/
      seedData.js         → datos de ejemplo iniciales
    hooks/
      useGameState.js     → conexión en tiempo real con la base de datos
    firebase.js           → configuración de Firebase
    styles/global.css     → estilos de toda la app
  firestore.rules          → reglas de seguridad de la base de datos
  .env.example             → plantilla de configuración
  README.md                → este archivo
```

---

## 14. Pruebas realizadas antes de la entrega

Se verificó el funcionamiento de: navegación entre pantallas, ingreso al
panel de administración, selección de dinámica activa, suma/resta de
puntajes en las tres dinámicas, revelado de respuestas en 100 Amanecidos
con su animación, marcado y reseteo de la X de respuesta incorrecta, avance
y retroceso de escalones en 8 Escalones, reproducción/pausa de audio en
En una Nota, reinicio de partidas individuales y reinicio total, guardado
automático ante recarga de página, y diseño responsive en notebook, tablet
y celular.
