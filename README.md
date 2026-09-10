# Día del Profesor — Instituto Amanecer 🎓 (un solo archivo HTML)

Toda la aplicación —menú, panel de administración, pantalla pública y vista
de participantes— vive en **un único archivo**: `dia-profesor.html`.
No hay carpetas de `css/` ni `js/` separadas: todo el estilo y toda la
lógica están adentro de ese mismo archivo.

Se navega entre las 4 "pantallas" agregando un `#` al final de la
dirección del archivo:

| Pantalla | Cómo se abre |
|---|---|
| Menú principal | `dia-profesor.html` (sin nada al final) |
| Pantalla pública (proyector) | `dia-profesor.html#publico` |
| Panel de administración | `dia-profesor.html#admin` |
| Ingreso de participantes (opcional) | `dia-profesor.html#unirse` |

También podés navegar tocando los botones del menú principal.

---

## 1. Configurar Firebase (una sola vez)

1. Entrá a [https://console.firebase.google.com](https://console.firebase.google.com),
   iniciá sesión con una cuenta de Google, y creá un proyecto (ej:
   `dia-profesor-amanecer`).
2. Menú lateral → "Compilación" → "Firestore Database" → "Crear base de
   datos" (modo producción, cualquier ubicación).
3. Dentro de Firestore, pestaña "Reglas": pegá el contenido de
   `firestore.rules` (viene en esta misma entrega) y publicá.
4. Volvé a la pantalla principal del proyecto → ícono **"</>"** ("Agregar
   app web") → ponele un nombre → crear. Te va a mostrar un bloque de
   código con `apiKey`, `authDomain`, etc.
5. Abrí `dia-profesor.html` con cualquier editor de texto (Bloc de notas
   sirve, aunque se recomienda algo como VS Code o Notepad++). Buscá,
   cerca del principio del `<script>`, este bloque:

   ```js
   const firebaseConfig = {
     apiKey: "TU_API_KEY",
     authDomain: "TU_PROYECTO.firebaseapp.com",
     projectId: "TU_PROYECTO",
     storageBucket: "TU_PROYECTO.appspot.com",
     messagingSenderId: "TU_SENDER_ID",
     appId: "TU_APP_ID",
   };
   const ADMIN_PASSWORD = "amanecer2026";
   ```

   Reemplazá cada valor por el que te dio Firebase, y cambiá
   `ADMIN_PASSWORD` por la contraseña que quieran usar. Guardá el archivo.

> Estos valores de Firebase no son secretos como una contraseña de banco:
> están pensados para viajar dentro del código del navegador. Lo que
> protege la base de datos son las Reglas de Firestore del paso 3.

---

## 2. Probarlo en tu computadora

Los navegadores no dejan abrir un archivo con `<script type="module">`
haciendo doble clic (protocolo `file://`) por un tema de seguridad del
propio navegador. Necesitás un mini-servidor local. La forma más simple:

```bash
# parado en la carpeta donde está dia-profesor.html
python3 -m http.server 8080
```

Y abrís `http://localhost:8080/dia-profesor.html` en el navegador.

Si no tenés Python, con la extensión gratuita "Live Server" de Visual
Studio Code alcanza: clic derecho sobre el archivo → "Open with Live
Server".

Si no querés instalar nada de esto, saltate directamente al paso 3 y
probalo ya publicado en Internet.

---

## 3. Publicarlo en Internet

### Opción más simple: GitHub Pages

1. Subí esta carpeta (el archivo `dia-profesor.html` + la carpeta
   `audio/`) a un repositorio de GitHub.
2. En el repositorio: **Settings → Pages** → Source: rama `main`,
   carpeta `/ (root)` → Guardar.
3. En 1-2 minutos vas a tener una dirección como:
   `https://tu-usuario.github.io/tu-repo/dia-profesor.html`
4. Para el proyector, usá esa misma dirección + `#publico`. Para el
   panel de control, + `#admin`.

### Alternativas

- **Netlify**: arrastrá la carpeta a netlify.com ("Deploy manually"),
  sin necesidad de Git.
- **Vercel**: funciona igual, tampoco necesita configuración especial
  al ser HTML puro sin build.

---

## 4. Cómo usarla el día del evento

1. Notebook del proyector → abrir `TU-DIRECCION/dia-profesor.html#publico`,
   pantalla completa (`F11`).
2. Notebook/celular de control → abrir
   `TU-DIRECCION/dia-profesor.html#admin`, ingresar la contraseña.
3. En "Inicio" del panel, elegir qué dinámica mostrar.
4. Usar los controles de cada sección (En una nota / 100 Amanecidos /
   8 Escalones) para manejar el juego. Todo se refleja al instante en
   la pantalla pública.

### Cargar contenido antes del evento

- **Canciones**: subí los `.mp3` a la carpeta `audio/` (y volvé a
  publicar el sitio), después cargalos desde `#admin → En una nota →
  Agregar canción` con el nombre exacto del archivo.
- **Preguntas de 100 Amanecidos y 8 Escalones**: se cargan directo
  desde el panel de administración, sin tocar código.

---

## 5. Solución de problemas comunes

**Pantalla en blanco o "Conectando..." que no avanza.**
→ Abrí la consola del navegador (F12 → "Console") y fijate el error.
Lo más común es no haber completado bien el bloque `firebaseConfig`
dentro del archivo.

**Error de tipo "Failed to load module script" al abrir con doble clic.**
→ No se puede abrir directamente desde la carpeta (`file://`); usá el
mini-servidor local (paso 2) o publicalo en Internet.

**El panel de admin y la pantalla pública no se sincronizan.**
→ Asegurate de que las dos pestañas estén usando la misma dirección
publicada (mismo proyecto de Firebase). Si una la abriste en tu compu y
otra ya publicada, no se van a conectar entre sí.

**Se recargó una pestaña sin querer.**
→ No pasa nada: todo el estado vive en Firestore. Al recargar, vuelve
a conectarse y muestra todo tal cual estaba.

**Me olvidé la contraseña del panel de admin.**
→ Está en texto plano dentro del archivo, buscá `ADMIN_PASSWORD`.

**Quiero borrar todo y empezar de cero.**
→ `#admin → Configuración → REINICIAR TODO`.

---

## 6. Qué se probó antes de la entrega

Se verificó que el bloque de JavaScript embebido no tenga errores de
sintaxis y que el HTML no tenga etiquetas mal cerradas. La lógica
(navegación entre las 4 pantallas por hash, puntajes, revelado de
respuestas, X de incorrecta, escalones, reproducción de audio, carga de
contenido y reinicio de partidas) es la misma que en las versiones
anteriores, ahora unificada en un solo archivo.
