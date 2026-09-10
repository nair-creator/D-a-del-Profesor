import { subscribeState } from "./state.js";

const contenido = document.getElementById("contenido");
const audioEl = document.getElementById("reproductor");
let songIndexActual = null;

subscribeState(render, mostrarError);

function mostrarError(err) {
  console.error(err);
  contenido.innerHTML = `
    <h2 style="color: var(--rojo);">Error de conexión</h2>
    <p>Revisá la conexión a Internet. Esta pantalla se reconectará sola.</p>
  `;
}

function render(state) {
  if (!state) return;

  if (state.currentGame === "home") contenido.innerHTML = vistaHome();
  else if (state.currentGame === "nota") contenido.innerHTML = vistaNota(state.nota);
  else if (state.currentGame === "amanecidos") contenido.innerHTML = vistaAmanecidos(state.amanecidos);
  else if (state.currentGame === "escalones") contenido.innerHTML = vistaEscalones(state.escalones);

  contenido.classList.add("anim-aparecer");

  // Sincronizar audio de "En una nota"
  if (state.currentGame === "nota") {
    const song = state.nota.songs[state.nota.currentSongIndex];
    if (song) {
      if (songIndexActual !== state.nota.currentSongIndex) {
        songIndexActual = state.nota.currentSongIndex;
        audioEl.src = `audio/${song.archivo}`;
      }
      if (state.nota.isPlaying) {
        audioEl.play().catch(() => {});
      } else {
        audioEl.pause();
      }
    }
  } else {
    audioEl.pause();
    songIndexActual = null;
  }
}

function vistaHome() {
  return `
    <p style="color: var(--gris); letter-spacing: 3px; font-weight: 600;">INSTITUTO AMANECER</p>
    <h1 style="font-size: 4rem; margin: 10px 0;">DÍA DEL PROFESOR</h1>
    <p style="color: var(--dorado); font-weight: 700; font-size: 1.4rem;">17 DE SEPTIEMBRE DE 2026</p>
    <div style="display:flex; gap:24px; margin-top:50px; flex-wrap:wrap; justify-content:center;">
      <div class="card" style="min-width:200px;">🎵 EN UNA NOTA</div>
      <div class="card" style="min-width:200px;">🏆 100 AMANECIDOS</div>
      <div class="card" style="min-width:200px;">🪜 8 ESCALONES</div>
    </div>
    <p style="margin-top:40px; color:var(--gris);">Esperando el inicio del acto...</p>
  `;
}

function vistaNota(nota) {
  const cancion = nota.songs[nota.currentSongIndex];
  return `
    <div style="width:100%;">
      <h1 style="font-size:2.6rem; margin-bottom:4px;">🎵 EN UNA NOTA</h1>
      <p style="color:var(--gris);">${cancion ? `Ronda ${cancion.ronda}` : "Esperando canción..."}</p>
      <div style="margin:30px 0;">
        ${nota.isPlaying
          ? `<div class="anim-brillo" style="font-size:4rem;">♪ ♫ ♪</div>`
          : `<div style="font-size:3rem; opacity:0.5;">🔇</div>`}
      </div>
      <div class="marcador">
        <div class="equipo ${nota.respondiendo === "equipo1" ? "activo" : ""}">
          <div style="font-weight:700;">${nota.equipo1.nombre}</div>
          <div class="puntaje">${nota.equipo1.puntaje}</div>
          ${nota.respondiendo === "equipo1" ? `<div class="anim-aparecer" style="color:var(--dorado); font-weight:700;">¡RESPONDIENDO!</div>` : ""}
        </div>
        <div class="equipo ${nota.respondiendo === "equipo2" ? "activo" : ""}">
          <div style="font-weight:700;">${nota.equipo2.nombre}</div>
          <div class="puntaje">${nota.equipo2.puntaje}</div>
          ${nota.respondiendo === "equipo2" ? `<div class="anim-aparecer" style="color:var(--dorado); font-weight:700;">¡RESPONDIENDO!</div>` : ""}
        </div>
      </div>
    </div>
  `;
}

function vistaAmanecidos(amanecidos) {
  const pregunta = amanecidos.questions[amanecidos.currentQuestionIndex];
  return `
    <div style="width:100%; max-width:800px;">
      <h1 style="font-size:2.6rem; margin-bottom:4px;">🏆 100 AMANECIDOS</h1>
      ${pregunta ? `
        <p style="font-size:1.4rem; font-weight:600; margin:10px 0 24px;">${escapeHtml(pregunta.pregunta)}</p>
        <div>
          ${pregunta.respuestas.map((r, i) => `
            <div class="respuesta-fila ${amanecidos.revealed[i] ? "anim-aparecer" : "oculta"}">
              <span>${amanecidos.revealed[i] ? `${i + 1}. ${escapeHtml(r.texto)}` : "████████████"}</span>
              ${amanecidos.revealed[i] ? `<span class="puntos">${r.puntos}</span>` : ""}
            </div>
          `).join("")}
        </div>
      ` : `<p style="color:var(--gris);">Esperando pregunta...</p>`}

      ${amanecidos.incorrectX ? `<div class="anim-x" style="font-size:6rem; font-weight:900; margin:10px 0;">✕</div>` : ""}

      <div class="marcador">
        <div class="equipo">
          <div style="font-weight:700;">${amanecidos.equipo1.nombre}</div>
          <div class="puntaje">${amanecidos.equipo1.puntaje}</div>
        </div>
        <div class="equipo">
          <div style="font-weight:700;">${amanecidos.equipo2.nombre}</div>
          <div class="puntaje">${amanecidos.equipo2.puntaje}</div>
        </div>
      </div>
    </div>
  `;
}

function vistaEscalones(escalones) {
  const pregunta = escalones.questions[escalones.currentQuestionIndex];
  const escalonesHtml = Array.from({ length: 8 }, (_, i) => i + 1)
    .map((n) => {
      const clase = n === escalones.currentStep ? "actual" : n < escalones.currentStep ? "superado" : "";
      const label = n === 8 ? "8 — FINAL" : n === 1 ? "1 — INICIO" : n;
      return `<div class="escalon ${clase}">${label}</div>`;
    })
    .join("");

  return `
    <div style="width:100%; max-width:700px;">
      <h1 style="font-size:2.6rem; margin-bottom:10px;">🪜 8 ESCALONES</h1>
      <div class="escalera">${escalonesHtml}</div>

      ${pregunta ? `
        <div class="card anim-aparecer" style="margin-top:16px;">
          <p style="color:var(--gris); margin-bottom:4px;">${escapeHtml(pregunta.categoria)}</p>
          <h3 style="margin-top:0;">${escapeHtml(pregunta.pregunta)}</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px;">
            ${pregunta.opciones.map((op, i) => `
              <div style="padding:10px 14px; border-radius:10px; background:rgba(255,255,255,0.08); text-align:left; font-weight:600;">
                ${String.fromCharCode(65 + i)}) ${escapeHtml(op)}
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      ${escalones.lastAnswerResult === "correct" ? `<div class="anim-aparecer" style="color:var(--verde); font-size:2rem; font-weight:900; margin-top:14px;">✓ ¡CORRECTO!</div>` : ""}
      ${escalones.lastAnswerResult === "incorrect" ? `<div class="anim-x" style="color:var(--rojo); font-size:2rem; font-weight:900; margin-top:14px;">✕ INCORRECTO</div>` : ""}
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
