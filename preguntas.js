/* ============================================================
   BANCO DE PREGUNTAS
   ============================================================ */

asegurarDatosIniciales();
marcarConexion(document.getElementById("estado-conexion"));

const refPreguntas = db.ref("preguntas");
let preguntas = {};

// --- Genera las 5 filas de respuestas del formulario ---
const contRespuestas = document.getElementById("f-respuestas");
for (let i = 0; i < 5; i++) {
  const fila = document.createElement("div");
  fila.className = "fila-respuesta";
  fila.innerHTML = `
    <span>${i + 1}</span>
    <input type="text" class="f-resp-texto" placeholder="Respuesta ${i + 1}">
    <input type="number" class="f-resp-puntos" placeholder="Pts" min="0">
  `;
  contRespuestas.appendChild(fila);
}

refPreguntas.on("value", (snap) => {
  preguntas = snap.val() || {};
  pintarLista();
});

function pintarLista() {
  const cont = document.getElementById("tabla-preguntas");
  const ids = Object.keys(preguntas).sort((a, b) => (preguntas[a].ronda || 1) - (preguntas[b].ronda || 1));
  if (ids.length === 0) {
    cont.innerHTML = `<p class="ayuda">No hay preguntas cargadas. Agregá una con el formulario de la izquierda.</p>`;
    return;
  }
  cont.innerHTML = "";
  ids.forEach((id) => {
    const p = preguntas[id];
    const item = document.createElement("div");
    item.className = "pregunta-item";
    item.innerHTML = `
      <div class="cabecera-item">
        <div>
          <div class="txt-pregunta">${escaparHtml(p.texto)}</div>
          <div class="meta"><span class="badge-ronda">Ronda ${p.ronda || 1}</span> ${p.esDemo ? " · pregunta de prueba" : ""}</div>
        </div>
        <div class="fila" style="gap:6px;">
          <button class="btn btn-fantasma" data-editar="${id}">Editar</button>
          <button class="btn btn-peligro" data-borrar="${id}">Borrar</button>
        </div>
      </div>
      <div class="respuestas-mini">
        ${(p.respuestas || []).map((r, i) => `<div><span>${i + 1}. ${escaparHtml(r.texto)}</span><span>${r.puntos} pts</span></div>`).join("")}
      </div>
    `;
    cont.appendChild(item);
  });

  cont.querySelectorAll("button[data-editar]").forEach((b) => {
    b.addEventListener("click", () => cargarEnFormulario(b.dataset.editar));
  });
  cont.querySelectorAll("button[data-borrar]").forEach((b) => {
    b.addEventListener("click", () => {
      if (confirm("¿Borrar esta pregunta?")) refPreguntas.child(b.dataset.borrar).remove();
    });
  });
}

function cargarEnFormulario(id) {
  const p = preguntas[id];
  if (!p) return;
  document.getElementById("id-edicion").value = id;
  document.getElementById("f-texto").value = p.texto || "";
  document.getElementById("f-ronda").value = p.ronda || 1;
  const filas = contRespuestas.querySelectorAll(".fila-respuesta");
  filas.forEach((fila, i) => {
    const r = (p.respuestas || [])[i] || { texto: "", puntos: "" };
    fila.querySelector(".f-resp-texto").value = r.texto || "";
    fila.querySelector(".f-resp-puntos").value = r.puntos != null ? r.puntos : "";
  });
  document.getElementById("titulo-form").textContent = "Editar pregunta";
  document.getElementById("btn-cancelar-edicion").style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function limpiarFormulario() {
  document.getElementById("id-edicion").value = "";
  document.getElementById("f-texto").value = "";
  document.getElementById("f-ronda").value = 1;
  contRespuestas.querySelectorAll(".f-resp-texto").forEach((i) => (i.value = ""));
  contRespuestas.querySelectorAll(".f-resp-puntos").forEach((i) => (i.value = ""));
  document.getElementById("titulo-form").textContent = "Nueva pregunta";
  document.getElementById("btn-cancelar-edicion").style.display = "none";
}

document.getElementById("btn-cancelar-edicion").addEventListener("click", limpiarFormulario);

document.getElementById("btn-guardar-pregunta").addEventListener("click", () => {
  const texto = document.getElementById("f-texto").value.trim();
  const ronda = parseInt(document.getElementById("f-ronda").value, 10) || 1;
  const filas = contRespuestas.querySelectorAll(".fila-respuesta");
  const respuestas = Array.from(filas).map((fila) => ({
    texto: fila.querySelector(".f-resp-texto").value.trim(),
    puntos: parseInt(fila.querySelector(".f-resp-puntos").value, 10) || 0
  }));

  if (!texto) { alert("Falta el texto de la pregunta."); return; }
  if (respuestas.some((r) => !r.texto)) { alert("Completá las 5 respuestas."); return; }

  const idEdicion = document.getElementById("id-edicion").value;
  const nuevaPregunta = { texto, ronda, respuestas };

  if (idEdicion) {
    refPreguntas.child(idEdicion).update(nuevaPregunta);
  } else {
    refPreguntas.push(nuevaPregunta);
  }
  limpiarFormulario();
});

document.getElementById("btn-borrar-demo").addEventListener("click", () => {
  if (!confirm("¿Borrar las preguntas de prueba (demo)?")) return;
  Object.keys(preguntas).forEach((id) => {
    if (preguntas[id].esDemo) refPreguntas.child(id).remove();
  });
});

document.getElementById("btn-borrar-todas").addEventListener("click", () => {
  if (!confirm("¿Borrar TODAS las preguntas del banco? Esta acción no se puede deshacer.")) return;
  refPreguntas.remove();
});
