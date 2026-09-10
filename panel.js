/* ============================================================
   PANEL DE CONTROL
   Cada acción del organizador escribe en Firebase. La pantalla
   pública (en otra pestaña o en otra computadora) se entera sola
   porque está escuchando esos mismos datos.
   ============================================================ */

asegurarDatosIniciales();
marcarConexion(document.getElementById("estado-conexion"));

const refJuego = db.ref("juego");
const refPreguntas = db.ref("preguntas");

let estado = null;        // último estado de /juego conocido
let preguntas = {};       // todas las preguntas del banco
let preguntaMostrada = null; // la pregunta que está activa ahora mismo (con sus respuestas)

// ------------------------------------------------------------
// Escuchar cambios
// ------------------------------------------------------------
refJuego.on("value", (snap) => {
  estado = snap.val() || {};
  pintarPanel();
});

refPreguntas.on("value", (snap) => {
  preguntas = snap.val() || {};
  llenarSelectorPreguntas();
  if (estado && estado.preguntaActualId) {
    preguntaMostrada = preguntas[estado.preguntaActualId] || null;
    pintarListaRespuestas();
  }
});

function llenarSelectorPreguntas() {
  const select = document.getElementById("select-pregunta");
  const seleccionadaAntes = select.value;
  select.innerHTML = "";
  const ids = Object.keys(preguntas).sort((a, b) => (preguntas[a].ronda || 1) - (preguntas[b].ronda || 1));
  if (ids.length === 0) {
    const op = document.createElement("option");
    op.textContent = "No hay preguntas cargadas todavía";
    select.appendChild(op);
    return;
  }
  ids.forEach((id) => {
    const p = preguntas[id];
    const op = document.createElement("option");
    op.value = id;
    op.textContent = `Ronda ${p.ronda || 1} — ${p.texto}`;
    select.appendChild(op);
  });
  if (ids.includes(seleccionadaAntes)) select.value = seleccionadaAntes;
}

// ------------------------------------------------------------
// Pintar el panel según el estado actual
// ------------------------------------------------------------
function pintarPanel() {
  if (!estado) return;

  document.getElementById("txt-estado-juego").textContent = estado.estado || "espera";
  document.getElementById("input-ronda").value = estado.ronda || 1;

  const e1 = (estado.equipos && estado.equipos[1]) || { nombre: "Equipo 1", puntos: 0, fallos: 0 };
  const e2 = (estado.equipos && estado.equipos[2]) || { nombre: "Equipo 2", puntos: 0, fallos: 0 };

  document.getElementById("ver-nombre-e1").textContent = e1.nombre || "Equipo 1";
  document.getElementById("ver-puntos-e1").textContent = e1.puntos || 0;
  document.getElementById("ver-nombre-e2").textContent = e2.nombre || "Equipo 2";
  document.getElementById("ver-puntos-e2").textContent = e2.puntos || 0;

  if (document.activeElement.id !== "nombre-e1") document.getElementById("nombre-e1").placeholder = e1.nombre || "Equipo 1";
  if (document.activeElement.id !== "nombre-e2") document.getElementById("nombre-e2").placeholder = e2.nombre || "Equipo 2";

  document.getElementById("btn-control-e1").classList.toggle("control-activo", estado.equipoConControl === 1);
  document.getElementById("btn-control-e2").classList.toggle("control-activo", estado.equipoConControl === 2);

  if (estado.preguntaActualId && preguntas[estado.preguntaActualId]) {
    preguntaMostrada = preguntas[estado.preguntaActualId];
  } else {
    preguntaMostrada = null;
  }
  pintarListaRespuestas();
}

function pintarListaRespuestas() {
  const cont = document.getElementById("lista-reveals");
  cont.innerHTML = "";
  if (!preguntaMostrada) {
    cont.innerHTML = `<p class="ayuda">Elegí "Mostrar pregunta" para ver las 5 respuestas acá.</p>`;
    return;
  }
  const reveladas = estado.reveladas || [false, false, false, false, false];
  (preguntaMostrada.respuestas || []).forEach((r, i) => {
    const fila = document.createElement("div");
    fila.className = "fila-reveal" + (reveladas[i] ? " ok" : "");
    fila.innerHTML = `
      <span class="n">${i + 1}</span>
      <span class="txt">${escaparHtml(r.texto)}</span>
      <span class="pts">${r.puntos} pts</span>
      <button class="btn ${reveladas[i] ? "" : "btn-primario"}" data-i="${i}" ${reveladas[i] ? "disabled" : ""}>
        ${reveladas[i] ? "Revelada" : "Revelar"}
      </button>
    `;
    cont.appendChild(fila);
  });
  cont.querySelectorAll("button[data-i]").forEach((btn) => {
    btn.addEventListener("click", () => revelarRespuesta(parseInt(btn.dataset.i, 10)));
  });
}

// ------------------------------------------------------------
// Acciones: control de partida
// ------------------------------------------------------------
document.getElementById("btn-iniciar").addEventListener("click", () => {
  refJuego.update({ estado: "jugando" });
});

document.getElementById("btn-reiniciar-ronda").addEventListener("click", () => {
  refJuego.update({ reveladas: [false, false, false, false, false], mostrarX: false });
});

document.getElementById("btn-reiniciar-partida").addEventListener("click", () => {
  if (!confirm("¿Reiniciar toda la partida? Se van a poner los puntajes y fallos en cero.")) return;
  refJuego.set(ESTADO_INICIAL_JUEGO);
});

document.getElementById("btn-finalizar").addEventListener("click", () => {
  refJuego.update({ estado: "finalizado" });
});

document.getElementById("btn-cambiar-ronda").addEventListener("click", () => {
  const n = parseInt(document.getElementById("input-ronda").value, 10) || 1;
  refJuego.update({ ronda: n, reveladas: [false, false, false, false, false], mostrarX: false });
});

// ------------------------------------------------------------
// Acciones: pregunta actual
// ------------------------------------------------------------
document.getElementById("btn-mostrar-pregunta").addEventListener("click", () => {
  const id = document.getElementById("select-pregunta").value;
  if (!id || !preguntas[id]) return;
  refJuego.update({
    preguntaActualId: id,
    reveladas: [false, false, false, false, false],
    mostrarX: false,
    estado: "jugando"
  });
});

function revelarRespuesta(indice) {
  if (!estado || !preguntaMostrada) return;
  const reveladas = (estado.reveladas || [false, false, false, false, false]).slice();
  if (reveladas[indice]) return;
  reveladas[indice] = true;

  const puntos = (preguntaMostrada.respuestas[indice] && preguntaMostrada.respuestas[indice].puntos) || 0;
  const equipo = estado.equipoConControl === 2 ? 2 : 1;
  const actualizacion = { reveladas };
  actualizacion[`equipos/${equipo}/puntos`] =
    ((estado.equipos && estado.equipos[equipo] && estado.equipos[equipo].puntos) || 0) + puntos;
  refJuego.update(actualizacion);
}

// ------------------------------------------------------------
// Acciones: respuesta incorrecta
// ------------------------------------------------------------
function marcarFallo(equipo) {
  const actual = (estado.equipos && estado.equipos[equipo] && estado.equipos[equipo].fallos) || 0;
  refJuego.update({
    mostrarX: true,
    [`equipos/${equipo}/fallos`]: Math.min(3, actual + 1)
  });
}
document.getElementById("btn-fallo-e1").addEventListener("click", () => marcarFallo(1));
document.getElementById("btn-fallo-e2").addEventListener("click", () => marcarFallo(2));
document.getElementById("btn-quitar-x").addEventListener("click", () => {
  refJuego.update({ mostrarX: false });
});

// ------------------------------------------------------------
// Acciones: equipo con el control
// ------------------------------------------------------------
document.getElementById("btn-control-e1").addEventListener("click", () => refJuego.update({ equipoConControl: 1 }));
document.getElementById("btn-control-e2").addEventListener("click", () => refJuego.update({ equipoConControl: 2 }));

// ------------------------------------------------------------
// Acciones: nombres y puntajes manuales
// ------------------------------------------------------------
document.getElementById("btn-guardar-nombre-e1").addEventListener("click", () => {
  const v = document.getElementById("nombre-e1").value.trim();
  if (v) refJuego.update({ "equipos/1/nombre": v });
});
document.getElementById("btn-guardar-nombre-e2").addEventListener("click", () => {
  const v = document.getElementById("nombre-e2").value.trim();
  if (v) refJuego.update({ "equipos/2/nombre": v });
});

function sumarPuntos(equipo, cantidad) {
  const actual = (estado.equipos && estado.equipos[equipo] && estado.equipos[equipo].puntos) || 0;
  refJuego.update({ [`equipos/${equipo}/puntos`]: Math.max(0, actual + cantidad) });
}
document.getElementById("btn-sumar10-e1").addEventListener("click", () => sumarPuntos(1, 10));
document.getElementById("btn-restar10-e1").addEventListener("click", () => sumarPuntos(1, -10));
document.getElementById("btn-sumar10-e2").addEventListener("click", () => sumarPuntos(2, 10));
document.getElementById("btn-restar10-e2").addEventListener("click", () => sumarPuntos(2, -10));

// ------------------------------------------------------------
// Acciones: declarar ganador
// ------------------------------------------------------------
document.getElementById("btn-ganador-e1").addEventListener("click", () => {
  refJuego.update({ estado: "finalizado", ganador: "1" });
});
document.getElementById("btn-ganador-e2").addEventListener("click", () => {
  refJuego.update({ estado: "finalizado", ganador: "2" });
});
