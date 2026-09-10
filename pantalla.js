/* ============================================================
   PANTALLA PÚBLICA
   Solo lee datos de Firebase y los muestra. No tiene botones ni
   escribe nada en la base de datos.
   ============================================================ */

asegurarDatosIniciales();

// --- Construye los 5 casilleros vacíos una sola vez ---
const tablero = document.getElementById("tablero");
for (let i = 0; i < 5; i++) {
  const fila = document.createElement("div");
  fila.className = "casillero";
  fila.id = `casillero-${i}`;
  fila.innerHTML = `
    <div class="numero">${i + 1}</div>
    <div class="texto-respuesta">█████████████</div>
    <div class="puntos">&nbsp;</div>
  `;
  tablero.appendChild(fila);
}

let preguntaActualCache = null;
let idPreguntaEscuchada = null;
let refPreguntaActual = null;

function pintarPregunta(pregunta) {
  const txt = document.getElementById("txt-pregunta");
  if (!pregunta) {
    txt.textContent = "La pregunta va a aparecer acá";
    txt.classList.add("vacia");
    for (let i = 0; i < 5; i++) {
      const c = document.getElementById(`casillero-${i}`);
      c.classList.remove("revelado");
      c.querySelector(".texto-respuesta").textContent = "█████████████";
      c.querySelector(".puntos").innerHTML = "&nbsp;";
    }
    return;
  }
  txt.textContent = pregunta.texto || "";
  txt.classList.remove("vacia");
  preguntaActualCache = pregunta;
}

function pintarReveladas(reveladas) {
  if (!preguntaActualCache) return;
  const respuestas = preguntaActualCache.respuestas || [];
  for (let i = 0; i < 5; i++) {
    const c = document.getElementById(`casillero-${i}`);
    const yaEstaba = c.classList.contains("revelado");
    const debeEstar = !!(reveladas && reveladas[i]);
    if (debeEstar && !yaEstaba) {
      c.classList.add("revelado");
      c.querySelector(".texto-respuesta").textContent = (respuestas[i] && respuestas[i].texto) || "";
      c.querySelector(".puntos").textContent = (respuestas[i] && respuestas[i].puntos != null) ? respuestas[i].puntos : "";
    } else if (!debeEstar && yaEstaba) {
      c.classList.remove("revelado");
      c.querySelector(".texto-respuesta").textContent = "█████████████";
      c.querySelector(".puntos").innerHTML = "&nbsp;";
    }
  }
}

function escucharPregunta(id) {
  if (refPreguntaActual) refPreguntaActual.off();
  if (!id) {
    preguntaActualCache = null;
    pintarPregunta(null);
    return;
  }
  idPreguntaEscuchada = id;
  refPreguntaActual = db.ref(`preguntas/${id}`);
  refPreguntaActual.on("value", (snap) => {
    pintarPregunta(snap.val());
  });
}

// --- Sonido simple de error, generado por WebAudio (sin archivos externos) ---
function reproducirSonidoError() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) { /* si el navegador bloquea audio autoplay, no pasa nada */ }
}

let puntosAnteriores = { 1: null, 2: null };
let mostrandoXAnterior = false;

db.ref("juego").on("value", (snap) => {
  const j = snap.val();
  if (!j) return;

  // Ronda y estado
  document.getElementById("pill-ronda").textContent = `RONDA ${j.ronda || 1}`;
  const estados = { espera: "Esperando inicio...", jugando: "En juego", finalizado: "Partida finalizada" };
  document.getElementById("pill-estado").textContent = estados[j.estado] || "";

  // Pregunta activa
  if (j.preguntaActualId !== idPreguntaEscuchada) {
    escucharPregunta(j.preguntaActualId);
  }

  // Respuestas reveladas
  pintarReveladas(j.reveladas);

  // Equipos
  const e1 = (j.equipos && j.equipos[1]) || { nombre: "Equipo 1", puntos: 0, fallos: 0 };
  const e2 = (j.equipos && j.equipos[2]) || { nombre: "Equipo 2", puntos: 0, fallos: 0 };
  document.getElementById("nombre-e1").textContent = (e1.nombre || "EQUIPO 1").toUpperCase();
  document.getElementById("nombre-e2").textContent = (e2.nombre || "EQUIPO 2").toUpperCase();

  const spPuntosE1 = document.getElementById("puntos-e1");
  const spPuntosE2 = document.getElementById("puntos-e2");
  spPuntosE1.textContent = e1.puntos || 0;
  spPuntosE2.textContent = e2.puntos || 0;

  if (puntosAnteriores[1] !== null && puntosAnteriores[1] !== e1.puntos) {
    spPuntosE1.classList.remove("rebote"); void spPuntosE1.offsetWidth; spPuntosE1.classList.add("rebote");
  }
  if (puntosAnteriores[2] !== null && puntosAnteriores[2] !== e2.puntos) {
    spPuntosE2.classList.remove("rebote"); void spPuntosE2.offsetWidth; spPuntosE2.classList.add("rebote");
  }
  puntosAnteriores[1] = e1.puntos;
  puntosAnteriores[2] = e2.puntos;

  // Marcador con el control (equipo en juego)
  document.getElementById("marcador-e1").classList.toggle("control", j.equipoConControl === 1);
  document.getElementById("marcador-e2").classList.toggle("control", j.equipoConControl === 2);

  // Fallos (hasta 3 por equipo)
  const pintarFallos = (contenedor, cantidad) => {
    contenedor.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const d = document.createElement("div");
      d.className = "fallo-punto" + (i < (cantidad || 0) ? " activo" : "");
      contenedor.appendChild(d);
    }
  };
  pintarFallos(document.getElementById("fallos-e1"), e1.fallos);
  pintarFallos(document.getElementById("fallos-e2"), e2.fallos);

  // X grande
  const overlayX = document.getElementById("overlay-x");
  if (j.mostrarX && !mostrandoXAnterior) {
    overlayX.classList.add("mostrar");
    reproducirSonidoError();
  } else if (!j.mostrarX) {
    overlayX.classList.remove("mostrar");
  }
  mostrandoXAnterior = !!j.mostrarX;

  // Pantalla de ganador
  const overlayGanador = document.getElementById("overlay-ganador");
  if (j.estado === "finalizado" && j.ganador) {
    const equipoGanador = j.ganador === "1" || j.ganador === 1 ? e1 : e2;
    document.getElementById("nombre-ganador").textContent = (equipoGanador.nombre || "").toUpperCase();
    document.getElementById("puntos-ganador").textContent = `${equipoGanador.puntos || 0} puntos`;
    overlayGanador.classList.add("mostrar");
  } else {
    overlayGanador.classList.remove("mostrar");
  }
});

// --- Código QR para que el público siga la pantalla desde el celular ---
// Se genera automáticamente con la URL actual de esta misma página,
// usando un servicio gratuito de generación de QR (requiere Internet).
(function generarQR() {
  const caja = document.getElementById("qr-caja");
  const img = document.getElementById("qr-img");
  const url = window.location.href;
  if (url.startsWith("http") && !url.startsWith("http://localhost") && !url.startsWith("file")) {
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    caja.style.display = "flex";
  }
})();
