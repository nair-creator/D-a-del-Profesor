# 100 Amanecidos Dicen
Dinámica para el Acto del Día del Profesor — Instituto Amanecer, 5.º Año Pre Promo 2027.

Esta carpeta contiene una página web completa y funcional, lista para usar durante el acto. No hace falta instalar nada raro: son archivos HTML, CSS y JavaScript comunes, más una base de datos gratuita de Google (Firebase) que sincroniza el panel de control con la pantalla del proyector en tiempo real.

---

## 1. Cómo está armado

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Menú de inicio con los 3 accesos |
| `pantalla.html` | Pantalla pública, para el proyector |
| `panel.html` | Panel de control, para el organizador |
| `preguntas.html` | Banco de preguntas (cargar/editar antes del acto) |
| `js/firebase-config.js` | Acá van tus datos de Firebase (paso 2) |
| `js/comun.js` | Preguntas de ejemplo y funciones compartidas |
| `js/pantalla.js`, `js/panel.js`, `js/preguntas.js` | La lógica de cada pantalla |
| `css/estilos.css` | Todo el diseño visual |

**Tecnologías usadas:** HTML, CSS y JavaScript "puro" (sin instalación ni paso de compilado), y **Firebase Realtime Database** para la sincronización en vivo entre el panel de control y la pantalla pública. Elegí Firebase porque es gratuito para este uso, no requiere programar un servidor propio, y actualiza los datos en todos los dispositivos conectados en fracciones de segundo.

**Cómo funciona la sincronización:** el panel de control escribe los cambios (puntaje, pregunta, revelar respuesta, marcar X, etc.) en una base de datos en la nube. La pantalla pública está todo el tiempo "escuchando" esa misma base de datos, así que en cuanto el organizador aprieta un botón, la pantalla se actualiza sola, sin recargar la página.

**Cómo se cargan las preguntas:** desde `preguntas.html`, con un formulario (texto + ronda + 5 respuestas con sus puntos). No hace falta tocar código para agregar, editar o borrar preguntas.

**Cómo se guardan los puntajes:** también en Firebase, dentro del mismo registro de la partida (`/juego`). Se mantienen aunque cambies de pregunta o cierres el navegador; solo se ponen en cero si el organizador aprieta "Reiniciar partida".

---

## 2. Configurar Firebase (una sola vez, antes del acto)

Necesitás una cuenta de Google. Firebase tiene un plan gratuito ("Spark") más que suficiente para esto.

1. Entrá a **https://console.firebase.google.com** e iniciá sesión.
2. Hacé clic en **"Agregar proyecto"**. Ponele un nombre, por ejemplo `amanecidos-dicen`. Podés desactivar Google Analytics, no hace falta.
3. Dentro del proyecto, en el menú lateral, andá a **Compilación → Realtime Database**.
4. Hacé clic en **"Crear base de datos"**. Elegí cualquier ubicación cercana y arrancá en **"modo de prueba"** (esto permite leer y escribir sin usuarios registrados; es lo más simple para un evento puntual de un día).
   - Las reglas de modo de prueba vencen a los 30 días. Si vas a usar esto mismo más adelante, entrá a la pestaña **"Reglas"** de la Realtime Database y reemplazalas por:
     ```json
     {
       "rules": {
         ".read": true,
         ".write": true
       }
     }
     ```
     (Esto deja la base totalmente abierta — está bien para este proyecto puntual, pero no seria recomendable para datos sensibles.)
5. Andá a **Configuración del proyecto** (el ícono de tuerca, arriba a la izquierda) → pestaña **"General"** → sección **"Tus apps"** → hacé clic en el ícono `</>` ("Web").
6. Ponele un apodo a la app (por ejemplo "panel") y hacé clic en **"Registrar app"**. **No hace falta** que actives Firebase Hosting en este paso.
7. Firebase te va a mostrar un bloque de código con `firebaseConfig = { apiKey: ..., authDomain: ..., ... }`. Copiá esos valores.
8. Abrí el archivo `js/firebase-config.js` de esta carpeta y reemplazá cada `"PEGA_AQUI_TU_..."` por el valor correspondiente que copiaste. Guardá el archivo.

Con eso ya está: los tres archivos HTML (`pantalla.html`, `panel.html`, `preguntas.html`) van a usar esa misma base de datos.

---

## 3. Probar la aplicación en tu computadora

No hace falta subir nada a Internet todavía para probarla:

1. Abrí la carpeta en tu computadora.
2. Hacé doble clic en `index.html` (se abre en el navegador).
3. Abrí `panel.html` en una pestaña y `pantalla.html` en otra pestaña (o en otra ventana). Vas a ver que al apretar los botones del panel, la pantalla se actualiza sola.
4. Las 3 preguntas de ejemplo ya están cargadas para que puedas probar todo el flujo antes de cargar las preguntas reales.

> Nota: algunos navegadores bloquean el sonido de la X hasta que el usuario interactúa una vez con la página (es una protección estándar de los navegadores, no un error). Con hacer un clic en cualquier parte de la pantalla pública alcanza para habilitarlo.

---

## 4. Publicar la página en Internet (para usarla desde dos dispositivos distintos)

Si el panel de control (notebook) y la pantalla pública (otra notebook conectada al proyector) van a ser **dos equipos distintos**, necesitás que la página esté publicada en Internet (no alcanza con abrir el archivo local en un solo equipo). La forma más simple y gratuita es **Firebase Hosting**, ya que usás Firebase de todas formas:

1. Instalá Node.js si no lo tenés (https://nodejs.org).
2. Instalá la herramienta de Firebase desde la terminal:
   ```
   npm install -g firebase-tools
   ```
3. Iniciá sesión:
   ```
   firebase login
   ```
4. Dentro de esta carpeta (`amanecidos/`), ejecutá:
   ```
   firebase init hosting
   ```
   - Elegí **"Use an existing project"** y seleccioná el proyecto que creaste en el paso 2.
   - Cuando pregunte por la carpeta pública ("What do you want to use as your public directory?"), escribí `.` (un punto, para usar esta misma carpeta).
   - Cuando pregunte si es una "single-page app", respondé **No**.
   - No sobrescribas `index.html` si te lo pregunta.
5. Publicá con:
   ```
   firebase deploy
   ```
6. Al terminar, la terminal te va a mostrar una URL parecida a `https://amanecidos-dicen.web.app`. Esa es la dirección pública de tu aplicación.

**Alternativas igual de válidas** si preferís no usar la terminal: subir la carpeta a **Netlify** (arrastrando la carpeta en https://app.netlify.com/drop) o a **GitHub Pages**. Cualquiera de las dos sirve porque son solo archivos estáticos; lo único que necesitan estar bien configurados son los datos de `js/firebase-config.js`.

Una vez publicada, entrá desde cada dispositivo a:
- Notebook del organizador: `https://tu-sitio.web.app/panel.html`
- Notebook conectada al proyector: `https://tu-sitio.web.app/pantalla.html`

---

## 5. Cargar las preguntas reales antes del acto

1. Entrá a `preguntas.html`.
2. Hacé clic en **"Borrar preguntas de prueba"** para sacar las 3 preguntas de ejemplo (podés dejarlas si querés seguir probando).
3. Completá el formulario de la izquierda con cada pregunta real de la encuesta: el texto, la ronda a la que pertenece, y las 5 respuestas con sus puntos (lo ideal es que sumen alrededor de 100 entre las 5, como en el programa original, pero no es obligatorio).
4. Hacé clic en **"Guardar pregunta"**. Repetí para cada pregunta.
5. Podés editar o borrar cualquier pregunta después con los botones "Editar" y "Borrar" de la lista de la derecha.

---

## 6. Cómo usarla durante el acto

**Antes de empezar:**
- Abrí `panel.html` en la notebook del organizador.
- Abrí `pantalla.html` en la notebook conectada al proyector (o compartí esa pantalla con "Duplicar/Extender" desde la misma notebook si vas a usar una sola).
- Apretá **"Iniciar partida"**.

**Durante cada pregunta:**
1. Elegí la pregunta en el desplegable de "Pregunta actual" y apretá **"Mostrar pregunta"**. Va a aparecer en la pantalla con las 5 respuestas ocultas.
2. Definí qué equipo tiene el control con los botones **"Le toca a Equipo 1 / 2"** (ese es el equipo que recibe los puntos cuando revelás una respuesta).
3. A medida que los equipos van diciendo respuestas:
   - Si aciertan, buscá esa respuesta en la lista "Respuestas" del panel y apretá **"Revelar"**. Se muestra en la pantalla y se suman los puntos al equipo con el control.
   - Si se equivocan, apretá **"✕ Falló Equipo 1"** o **"✕ Falló Equipo 2"**. Aparece una X grande en la pantalla y se suma un fallo (hasta 3) para ese equipo. Apretá **"Quitar X de la pantalla"** cuando quieras que desaparezca antes de la próxima respuesta.
4. Cuando termine la pregunta, elegí la próxima desde el desplegable y volvé a apretar "Mostrar pregunta" (esto limpia automáticamente el tablero anterior).
5. Para pasar de ronda, cambiá el número en "Ronda" y apretá **"Cambiar de ronda"**.

**Ajustes manuales:** si necesitás sumar o restar puntos a mano (por ejemplo, una bonificación), usá los botones **+10 / -10** de cada equipo. También podés cambiar el nombre de cada equipo con el campo de texto y "Guardar nombre".

**Para terminar:** apretá **"Ganó Equipo 1"** o **"Ganó Equipo 2"** — esto muestra la pantalla final de ganador en el proyector. Si necesitás jugar otra partida después, usá "Reiniciar partida".

---

## 7. Sobre las 3 X por equipo

El sistema ya incluye un contador de hasta 3 fallos por equipo (se ven como 3 cuadraditos debajo del puntaje, que se van llenando de rojo). Cada vez que apretás "Falló Equipo 1/2" se suma un fallo a ese contador y aparece la X grande en pantalla. Si en algún momento de tu dinámica un equipo llega a 3 fallos y eso significa algo especial (por ejemplo, que pierde el turno y el control pasa al otro equipo), es una regla que el organizador aplica manualmente: cuando veas que un equipo llegó a 3 fallos, apretá el botón "Le toca a Equipo 2 / 1" para pasarle el control al otro equipo. No hicimos esto automático a propósito, para que el organizador tenga la libertad de decidir en el momento (por ejemplo, si un equipo "roba" la ronda con una sola respuesta, como en el programa original).

---

## 8. Acceso desde el celular del público (opcional)

La pantalla pública (`pantalla.html`) genera automáticamente un código QR en la esquina inferior derecha una vez que la publicás en Internet (paso 4). Cualquiera del público puede escanearlo con su celular y va a ver exactamente lo mismo que el proyector, actualizado en vivo. No necesitan crear ninguna cuenta ni tocar nada: es solo para mirar, no para jugar, así que no interfiere con el control del organizador.

---

## 9. Preguntas frecuentes

- **¿Necesito Internet el día del acto?** Sí. La sincronización en tiempo real depende de la conexión a Firebase. Si el patio tiene wifi o podés usar datos móviles como punto de acceso en ambas notebooks, alcanza.
- **¿Qué pasa si se corta Internet un segundo?** El panel y la pantalla muestran "Sin conexión..." arriba a la derecha (en el panel) hasta que se reconecte solo; los datos no se pierden.
- **¿Puedo usar el panel y la pantalla en la misma notebook?** Sí, con dos pestañas del navegador, o compartiendo la pantalla completa si no tenés un segundo equipo.
- **¿Puedo agregar preguntas el mismo día del acto, mientras se juega?** Sí, `preguntas.html` funciona en cualquier momento; los cambios aparecen enseguida en el desplegable del panel.
