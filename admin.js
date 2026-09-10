import { subscribeState, updateState, resetAll } from "./state.js";
import { ADMIN_PASSWORD } from "./firebase-config.js";

const app = document.getElementById("app");
const SESSION_KEY = "amanecer_admin_ok";

let estadoActual = null;
let seccionActual = "inicio";
let errorConexion = null;

const SECCIONES = [
  { id: "inicio", label: "🏠 Inicio" },
  { id: "nota", label: "🎵 En una nota" },
  { id: "amanecidos", label: "🏆 100 Amanecidos" },
  { id: "escalones", label: "🪜 8 Escalones" },
  { id: "puntajes", label: "📊 Puntajes" },
  { id: "configuracion", label: "⚙️ Configuración" },
];

// ============================================================
// ARRANQUE / LOGIN
// ============================================================
if (sessionStorage.getItem(SESSION_KEY) === "1") {
  iniciarApp();
} else {
  renderLogin();
}

function renderLogin() {
  app.innerHTML = `
    <div class="pantalla">
      <h2>🔐 Panel de Administración</h2>
      <form id="form-login" class="card" style="max-width:320px; width:100%;">
        <label>Contraseña</label>
        <input type="password" id="input-password" autofocus />
        <p id="error-login" style="color:var(--rojo); display:none;">Contraseña incorrecta.</p>
        <div style="height:12px;"></div>
        <button class="btn btn-dorado" type="submit" style="width:100%;">Ingresar</button>
      </form>
    </div>
  `;
  document.getElementById("form-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const valor = document.getElementById("input-password").value;
    if (valor === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      iniciarApp();
    } else {
      document.getElementById("error-login").style.display = "block";
    }
  });
}

function iniciarApp() {
  app.innerHTML = `<div class="pantalla">Conectando...</div>`;
  subscribeState(
    (state) => {
      estadoActual = state;
      errorConexion = null;
      renderAdmin();
    },
    (err) => {
      console.error(err);
      errorConexion = err;
      renderAdmin();
    }
  );
}

// ============================================================
// RENDER PRINCIPAL
// ============================================================
function renderAdmin() {
  if (errorConexion) {
    app.innerHTML = `
      <div class="pantalla">
        <h2 style="color:var(--rojo);">Error de conexión con la base de datos</h2>
        <p>Revisá tu conexión a Internet y la configuración de Firebase (ver README).</p>
      </div>
    `;
    return;
  }

  if (!estadoActual) {
    app.innerHTML = `<div class="pantalla">Conectando...</div>`;
    return;
  }

  app.innerHTML = `
    <div class="grid-admin">
      <div class="sidebar">
        <p style="color:var(--gris); font-size:0.75rem; padding:0 14px;">CONTROL DEL EVENTO</p>
        ${SECCIONES.map(
          (s) => `<button data-action="nav" data-section="${s.id}" class="${seccionActual === s.id ? "activo" : ""}">${s.label}</button>`
        ).join("")}
      </div>
      <div class="admin-content" id="admin-content">
        ${renderSeccion()}
      </div>
    </div>
  `;

  attachHandlersSeccion();
}

function renderSeccion() {
  switch (seccionActual) {
    case "inicio": return seccionInicio(estadoActual);
    case "nota": return seccionNota(estadoActual.nota);
    case "amanecidos": return seccionAmanecidos(estadoActual.amanecidos);
    case "escalones": return seccionEscalones(estadoActual.escalones);
    case "puntajes": return seccionPuntajes(estadoActual);
    case "configuracion": return seccionConfiguracion(estadoActual);
    default: return "";
  }
}

// Delegación de eventos: un solo listener para toda la vida de la página.
app.addEventListener("click", onClick);
app.addEventListener("change", onChange);
app.addEventListener("submit", onSubmit);

async function onClick(e) {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  // Navegación de la barra lateral (no toca Firestore)
  if (action === "nav") {
    seccionActual = el.dataset.section;
    renderAdmin();
    return;
  }

  if (!estadoActual) return;

  // ---- INICIO ----
  if (action === "set-game") {
    await updateState({ currentGame: el.dataset.game });
  }

  // ---- EN UNA NOTA ----
  else if (action === "nota-sumar") {
    const nota = estadoActual.nota;
    const eq = el.dataset.equipo;
    const delta = Number(el.dataset.delta);
    await updateState({ nota: { ...nota, [eq]: { ...nota[eq], puntaje: Math.max(0, nota[eq].puntaje + delta) } } });
  } else if (action === "nota-responde") {
    await updateState({ nota: { ...estadoActual.nota, respondiendo: el.dataset.equipo } });
  } else if (action === "nota-limpiar-respondiendo") {
    await updateState({ nota: { ...estadoActual.nota, respondiendo: null } });
  } else if (action === "nota-reiniciar-puntajes") {
    const nota = estadoActual.nota;
    await updateState({
      nota: {
        ...nota,
        equipo1: { ...nota.equipo1, puntaje: 0 },
        equipo2: { ...nota.equipo2, puntaje: 0 },
      },
    });
  } else if (action === "nota-play") {
    await updateState({ nota: { ...estadoActual.nota, isPlaying: true } });
  } else if (action === "nota-pause" || action === "nota-reset-fragmento") {
    await updateState({ nota: { ...estadoActual.nota, isPlaying: false } });
  } else if (action === "nota-siguiente") {
    const nota = estadoActual.nota;
    await updateState({
      nota: { ...nota, currentSongIndex: nota.currentSongIndex + 1, isPlaying: false, respondiendo: null },
    });
  } else if (action === "nota-elegir-cancion") {
    await updateState({ nota: { ...estadoActual.nota, currentSongIndex: Number(el.dataset.index), isPlaying: false } });
  } else if (action === "nota-borrar-cancion") {
    const nota = estadoActual.nota;
    const songs = nota.songs.filter((s) => s.id !== el.dataset.id);
    const idx = Math.min(nota.currentSongIndex, Math.max(0, songs.length - 1));
    await updateState({ nota: { ...nota, songs, currentSongIndex: idx } });
  }

  // ---- 100 AMANECIDOS ----
  else if (action === "amanecidos-sumar") {
    const am = estadoActual.amanecidos;
    const eq = el.dataset.equipo;
    const delta = Number(el.dataset.delta);
    await updateState({ amanecidos: { ...am, [eq]: { ...am[eq], puntaje: Math.max(0, am[eq].puntaje + delta) } } });
  } else if (action === "amanecidos-revelar") {
    const am = estadoActual.amanecidos;
    const revealed = [...am.revealed];
    revealed[Number(el.dataset.index)] = true;
    await updateState({ amanecidos: { ...am, revealed } });
  } else if (action === "amanecidos-ocultar-todo") {
    await updateState({ amanecidos: { ...estadoActual.amanecidos, revealed: [false, false, false, false, false] } });
  } else if (action === "amanecidos-incorrecta") {
    await updateState({ amanecidos: { ...estadoActual.amanecidos, incorrectX: true } });
  } else if (action === "amanecidos-quitar-x") {
    await updateState({ amanecidos: { ...estadoActual.amanecidos, incorrectX: false } });
  } else if (action === "amanecidos-elegir-pregunta") {
    await updateState({
      amanecidos: {
        ...estadoActual.amanecidos,
        currentQuestionIndex: Number(el.dataset.index),
        revealed: [false, false, false, false, false],
        incorrectX: false,
      },
    });
  } else if (action === "amanecidos-borrar-pregunta") {
    const am = estadoActual.amanecidos;
    const questions = am.questions.filter((q) => q.id !== el.dataset.id);
    const idx = Math.min(am.currentQuestionIndex, Math.max(0, questions.length - 1));
    await updateState({ amanecidos: { ...am, questions, currentQuestionIndex: idx, revealed: [false, false, false, false, false] } });
  }

  // ---- 8 ESCALONES ----
  else if (action === "escalones-correcta") {
    const esc = estadoActual.escalones;
    await updateState({ escalones: { ...esc, currentStep: Math.min(8, esc.currentStep + 1), lastAnswerResult: "correct" } });
  } else if (action === "escalones-incorrecta") {
    await updateState({ escalones: { ...estadoActual.escalones, lastAnswerResult: "incorrect" } });
  } else if (action === "escalones-avanzar") {
    const esc = estadoActual.escalones;
    await updateState({
      escalones: {
        ...esc,
        currentQuestionIndex: Math.min(esc.questions.length - 1, esc.currentQuestionIndex + 1),
        lastAnswerResult: null,
      },
    });
  } else if (action === "escalones-retroceder") {
    const esc = estadoActual.escalones;
    await updateState({ escalones: { ...esc, currentStep: Math.max(1, esc.currentStep - 1), lastAnswerResult: null } });
  } else if (action === "escalones-reiniciar") {
    await updateState({ escalones: { ...estadoActual.escalones, currentStep: 1, currentQuestionIndex: 0, lastAnswerResult: null } });
  } else if (action === "escalones-elegir-pregunta") {
    await updateState({ escalones: { ...estadoActual.escalones, currentQuestionIndex: Number(el.dataset.index) } });
  } else if (action === "escalones-borrar-pregunta") {
    const esc = estadoActual.escalones;
    const questions = esc.questions.filter((q) => q.id !== el.dataset.id);
    const idx = Math.min(esc.currentQuestionIndex, Math.max(0, questions.length - 1));
    await updateState({ escalones: { ...esc, questions, currentQuestionIndex: idx } });
  }

  // ---- CONFIGURACIÓN ----
  else if (action === "config-volver-inicio") {
    await updateState({ currentGame: "home" });
  } else if (action === "config-reset-all") {
    const ok = window.confirm(
      "¿Seguro? Esto borra TODOS los puntajes, preguntas y canciones cargadas, y vuelve a los valores de ejemplo. Esta acción no se puede deshacer."
    );
    if (ok) await resetAll();
  }
}

async function onChange(e) {
  const el = e.target.closest("[data-action]");
  if (!el || !estadoActual) return;
  const action = el.dataset.action;

  if (action === "amanecidos-actualizar-puntos") {
    const am = estadoActual.amanecidos;
    const questions = [...am.questions];
    const q = { ...questions[am.currentQuestionIndex] };
    q.respuestas = q.respuestas.map((r, idx) => (idx === Number(el.dataset.index) ? { ...r, puntos: Number(el.value) } : r));
    questions[am.currentQuestionIndex] = q;
    await updateState({ amanecidos: { ...am, questions } });
  } else if (action === "config-toggle-sonido") {
    await updateState({ soundEffects: el.checked });
  }
}

async function onSubmit(e) {
  const form = e.target;
  e.preventDefault();

  if (form.id === "form-agregar-cancion") {
    const nota = estadoActual.nota;
    const titulo = form.querySelector("#nc-titulo").value.trim();
    const artista = form.querySelector("#nc-artista").value.trim();
    const archivo = form.querySelector("#nc-archivo").value.trim();
    const ronda = Number(form.querySelector("#nc-ronda").value) || 1;
    if (!titulo || !archivo) return;
    const songs = [...nota.songs, { id: `s${Date.now()}`, titulo, artista, archivo, ronda }];
    await updateState({ nota: { ...nota, songs } });
  }

  else if (form.id === "form-agregar-pregunta-amanecidos") {
    const am = estadoActual.amanecidos;
    const pregunta = form.querySelector("#ap-pregunta").value.trim();
    const respuestas = [0, 1, 2, 3, 4].map((i) => ({
      texto: form.querySelector(`#ap-resp-${i}`).value.trim(),
      puntos: Number(form.querySelector(`#ap-puntos-${i}`).value) || 0,
    }));
    if (!pregunta || respuestas.some((r) => !r.texto)) return;
    const questions = [...am.questions, { id: `q${Date.now()}`, pregunta, respuestas }];
    await updateState({ amanecidos: { ...am, questions } });
  }

  else if (form.id === "form-agregar-pregunta-escalones") {
    const esc = estadoActual.escalones;
    const categoria = form.querySelector("#ee-categoria").value.trim();
    const pregunta = form.querySelector("#ee-pregunta").value.trim();
    const opciones = [0, 1, 2, 3].map((i) => form.querySelector(`#ee-opcion-${i}`).value.trim());
    const correcta = Number(form.querySelector("#ee-correcta").value);
    if (!pregunta || opciones.some((o) => !o)) return;
    const questions = [...esc.questions, { id: `e${Date.now()}`, categoria, pregunta, opciones, correcta }];
    await updateState({ escalones: { ...esc, questions } });
  }
}

function attachHandlersSeccion() {
  // Los handlers de clic/cambio/submit ya están delegados en `app`
  // (se agregaron una sola vez arriba). Esta función queda como
  // punto de extensión si en el futuro hace falta algo puntual.
}

// ============================================================
// SECCIONES (generan el HTML de cada pantalla del admin)
// ============================================================
function seccionInicio(state) {
  return `
    <h2>🏠 Elegir dinámica activa</h2>
    <p style="color:var(--gris);">Esto es lo que se muestra ahora mismo en la pantalla pública (proyector).</p>
    <div style="display:flex; gap:16px; flex-wrap:wrap;">
      <button class="btn btn-grande btn-outline" data-action="set-game" data-game="home">Pantalla de inicio</button>
      <button class="btn btn-grande btn-dorado" data-action="set-game" data-game="nota">🎵 EN UNA NOTA</button>
      <button class="btn btn-grande btn-dorado" data-action="set-game" data-game="amanecidos">🏆 100 AMANECIDOS</button>
      <button class="btn btn-grande btn-dorado" data-action="set-game" data-game="escalones">🪜 8 ESCALONES</button>
    </div>
    <p style="margin-top:30px; color:var(--gris);">
      Dinámica activa ahora: <strong style="color:var(--dorado);">${state.currentGame}</strong>
    </p>
  `;
}

function seccionNota(nota) {
  const cancion = nota.songs[nota.currentSongIndex];
  return `
    <h2>🎵 En una Nota</h2>
    <div class="marcador">
      ${["equipo1", "equipo2"].map((eq) => `
        <div class="equipo ${nota.respondiendo === eq ? "activo" : ""}">
          <div style="font-weight:700;">${nota[eq].nombre}</div>
          <div class="puntaje">${nota[eq].puntaje}</div>
          <div style="display:flex; gap:6px; margin-top:8px; justify-content:center;">
            <button class="btn btn-verde" data-action="nota-sumar" data-equipo="${eq}" data-delta="1">+1</button>
            <button class="btn btn-rojo" data-action="nota-sumar" data-equipo="${eq}" data-delta="-1">-1</button>
          </div>
          <button class="btn btn-dorado" style="margin-top:8px; width:100%;" data-action="nota-responde" data-equipo="${eq}">
            RESPONDE ${nota[eq].nombre}
          </button>
        </div>
      `).join("")}
    </div>

    <div style="display:flex; gap:10px; justify-content:center; margin-bottom:20px; flex-wrap:wrap;">
      <button class="btn btn-outline" data-action="nota-limpiar-respondiendo">Limpiar "respondiendo"</button>
      <button class="btn btn-outline" data-action="nota-reiniciar-puntajes">Reiniciar puntajes</button>
    </div>

    <div class="card">
      <h3>Reproducción</h3>
      <p>Canción actual: <strong>${cancion ? `${escapeHtml(cancion.titulo)} — ${escapeHtml(cancion.artista)}` : "ninguna"}</strong></p>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn btn-verde" data-action="nota-play" ${!cancion ? "disabled" : ""}>▶ Reproducir</button>
        <button class="btn btn-rojo" data-action="nota-pause">⏸ Pausar</button>
        <button class="btn btn-outline" data-action="nota-reset-fragmento">⏮ Reiniciar fragmento</button>
        <button class="btn" data-action="nota-siguiente" ${nota.currentSongIndex >= nota.songs.length - 1 ? "disabled" : ""}>⏭ Siguiente canción</button>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <h3>Canciones cargadas</h3>
      <div class="lista-items">
        ${nota.songs.map((s, i) => `
          <div class="item-fila ${i === nota.currentSongIndex ? "seleccionado" : ""}">
            <span>Ronda ${s.ronda} — ${escapeHtml(s.titulo)} (${escapeHtml(s.artista)}) — ${escapeHtml(s.archivo)}</span>
            <div style="display:flex; gap:6px;">
              <button class="btn" data-action="nota-elegir-cancion" data-index="${i}">Elegir</button>
              <button class="btn btn-rojo" data-action="nota-borrar-cancion" data-id="${s.id}">Borrar</button>
            </div>
          </div>
        `).join("")}
      </div>

      <h4 style="margin-top:20px;">Agregar canción</h4>
      <p style="color:var(--gris); font-size:0.85rem;">
        Subí antes el archivo .mp3 a la carpeta <code>audio/</code> (ver README).
      </p>
      <form id="form-agregar-cancion">
        <div class="fila-form">
          <div><label>Título</label><input id="nc-titulo" /></div>
          <div><label>Artista</label><input id="nc-artista" /></div>
          <div><label>Archivo (ej: cancion3.mp3)</label><input id="nc-archivo" /></div>
          <div><label>Ronda</label><input type="number" min="1" id="nc-ronda" value="1" /></div>
        </div>
        <button class="btn btn-dorado" type="submit">Agregar canción</button>
      </form>
    </div>
  `;
}

function seccionAmanecidos(am) {
  const pregunta = am.questions[am.currentQuestionIndex];
  return `
    <h2>🏆 100 Amanecidos</h2>
    <div class="marcador">
      ${["equipo1", "equipo2"].map((eq) => `
        <div class="equipo">
          <div style="font-weight:700;">${am[eq].nombre}</div>
          <div class="puntaje">${am[eq].puntaje}</div>
          <div style="display:flex; gap:6px; margin-top:8px; justify-content:center;">
            <button class="btn btn-verde" data-action="amanecidos-sumar" data-equipo="${eq}" data-delta="10">+10</button>
            <button class="btn btn-rojo" data-action="amanecidos-sumar" data-equipo="${eq}" data-delta="-10">-10</button>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="card">
      <h3>Pregunta actual</h3>
      ${pregunta ? `
        <p style="font-weight:700; font-size:1.1rem;">${escapeHtml(pregunta.pregunta)}</p>
        ${pregunta.respuestas.map((r, i) => `
          <div class="item-fila" style="margin-bottom:8px;">
            <span>${i + 1}. ${escapeHtml(r.texto)} ${am.revealed[i] ? `<em style="color:var(--verde);">(revelada)</em>` : ""}</span>
            <div style="display:flex; gap:8px; align-items:center;">
              <input type="number" style="width:70px;" value="${r.puntos}" data-action="amanecidos-actualizar-puntos" data-index="${i}" />
              <button class="btn" data-action="amanecidos-revelar" data-index="${i}" ${am.revealed[i] ? "disabled" : ""}>Revelar</button>
            </div>
          </div>
        `).join("")}
        <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;">
          <button class="btn btn-outline" data-action="amanecidos-ocultar-todo">Ocultar todas de nuevo</button>
          <button class="btn btn-rojo" data-action="amanecidos-incorrecta">❌ RESPUESTA INCORRECTA</button>
          <button class="btn btn-outline" data-action="amanecidos-quitar-x">Quitar X</button>
        </div>
      ` : `<p style="color:var(--gris);">No hay preguntas cargadas todavía.</p>`}
    </div>

    <div class="card" style="margin-top:20px;">
      <h3>Preguntas cargadas</h3>
      <div class="lista-items">
        ${am.questions.map((q, i) => `
          <div class="item-fila ${i === am.currentQuestionIndex ? "seleccionado" : ""}">
            <span>${escapeHtml(q.pregunta)}</span>
            <div style="display:flex; gap:6px;">
              <button class="btn" data-action="amanecidos-elegir-pregunta" data-index="${i}">Elegir</button>
              <button class="btn btn-rojo" data-action="amanecidos-borrar-pregunta" data-id="${q.id}">Borrar</button>
            </div>
          </div>
        `).join("")}
      </div>

      <h4 style="margin-top:20px;">Agregar pregunta nueva</h4>
      <form id="form-agregar-pregunta-amanecidos">
        <label>Pregunta</label>
        <input id="ap-pregunta" />
        <div style="height:10px;"></div>
        ${[0, 1, 2, 3, 4].map((i) => `
          <div class="fila-form" style="grid-template-columns: 1fr 100px;">
            <input id="ap-resp-${i}" placeholder="Respuesta ${i + 1}" />
            <input type="number" id="ap-puntos-${i}" value="${[50, 40, 30, 20, 10][i]}" />
          </div>
        `).join("")}
        <button class="btn btn-dorado" type="submit">Agregar pregunta</button>
      </form>
    </div>
  `;
}

function seccionEscalones(esc) {
  const pregunta = esc.questions[esc.currentQuestionIndex];
  return `
    <h2>🪜 8 Escalones</h2>
    <div class="card">
      <p>Escalón actual: <strong>${esc.currentStep} / 8</strong></p>
      ${pregunta ? `
        <p style="color:var(--gris);">${escapeHtml(pregunta.categoria)}</p>
        <p style="font-weight:700; font-size:1.1rem;">${escapeHtml(pregunta.pregunta)}</p>
        <ul>
          ${pregunta.opciones.map((op, i) => `
            <li style="color:${i === pregunta.correcta ? "var(--verde)" : "var(--blanco)"};">
              ${String.fromCharCode(65 + i)}) ${escapeHtml(op)} ${i === pregunta.correcta ? "✓ correcta" : ""}
            </li>
          `).join("")}
        </ul>
      ` : `<p style="color:var(--gris);">No hay preguntas cargadas todavía.</p>`}

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button class="btn btn-verde" data-action="escalones-correcta">✓ RESPUESTA CORRECTA</button>
        <button class="btn btn-rojo" data-action="escalones-incorrecta">✕ RESPUESTA INCORRECTA</button>
        <button class="btn" data-action="escalones-avanzar">AVANZAR (siguiente pregunta)</button>
        <button class="btn btn-outline" data-action="escalones-retroceder">RETROCEDER escalón</button>
        <button class="btn btn-outline" data-action="escalones-reiniciar">REINICIAR partida</button>
      </div>
    </div>

    <div class="card" style="margin-top:20px;">
      <h3>Preguntas cargadas (una por escalón, en orden)</h3>
      <div class="lista-items">
        ${esc.questions.map((q, i) => `
          <div class="item-fila ${i === esc.currentQuestionIndex ? "seleccionado" : ""}">
            <span>${i + 1}. [${escapeHtml(q.categoria)}] ${escapeHtml(q.pregunta)}</span>
            <div style="display:flex; gap:6px;">
              <button class="btn" data-action="escalones-elegir-pregunta" data-index="${i}">Elegir</button>
              <button class="btn btn-rojo" data-action="escalones-borrar-pregunta" data-id="${q.id}">Borrar</button>
            </div>
          </div>
        `).join("")}
      </div>

      <h4 style="margin-top:20px;">Agregar pregunta</h4>
      <form id="form-agregar-pregunta-escalones">
        <div class="fila-form">
          <div><label>Categoría</label><input id="ee-categoria" /></div>
          <div style="grid-column: 1 / -1;"><label>Pregunta</label><input id="ee-pregunta" /></div>
        </div>
        <div class="fila-form">
          ${[0, 1, 2, 3].map((i) => `
            <div><label>Opción ${String.fromCharCode(65 + i)}</label><input id="ee-opcion-${i}" /></div>
          `).join("")}
        </div>
        <label>Opción correcta</label>
        <select id="ee-correcta">
          ${[0, 1, 2, 3].map((i) => `<option value="${i}">${String.fromCharCode(65 + i)}</option>`).join("")}
        </select>
        <div style="height:12px;"></div>
        <button class="btn btn-dorado" type="submit">Agregar pregunta</button>
      </form>
    </div>
  `;
}

function seccionPuntajes(state) {
  return `
    <h2>📊 Puntajes</h2>
    <div class="card">
      <h3>🎵 En una Nota</h3>
      <p>${state.nota.equipo1.nombre}: <strong>${state.nota.equipo1.puntaje}</strong></p>
      <p>${state.nota.equipo2.nombre}: <strong>${state.nota.equipo2.puntaje}</strong></p>
    </div>
    <div class="card" style="margin-top:16px;">
      <h3>🏆 100 Amanecidos</h3>
      <p>${state.amanecidos.equipo1.nombre}: <strong>${state.amanecidos.equipo1.puntaje}</strong></p>
      <p>${state.amanecidos.equipo2.nombre}: <strong>${state.amanecidos.equipo2.puntaje}</strong></p>
    </div>
    <div class="card" style="margin-top:16px;">
      <h3>🪜 8 Escalones</h3>
      <p>Escalón actual: <strong>${state.escalones.currentStep} / 8</strong></p>
    </div>
    <p style="color:var(--gris); margin-top:16px; font-size:0.85rem;">
      Todos los puntajes se guardan automáticamente en la nube apenas se modifican:
      no hace falta ningún botón de "guardar" adicional. Si la notebook se reinicia o
      se recarga la página, al volver a entrar al panel vas a ver todo tal cual lo dejaste.
    </p>
  `;
}

function seccionConfiguracion(state) {
  return `
    <h2>⚙️ Configuración</h2>
    <div class="card">
      <h3>Sonido</h3>
      <label style="display:flex; align-items:center; gap:10px;">
        <input type="checkbox" style="width:auto;" data-action="config-toggle-sonido" ${state.soundEffects ? "checked" : ""} />
        Efectos de sonido activados
      </label>
    </div>
    <div class="card" style="margin-top:20px;">
      <h3>Navegación general</h3>
      <button class="btn" data-action="config-volver-inicio">Volver a la Pantalla de Inicio</button>
    </div>
    <div class="card" style="margin-top:20px; border-color:var(--rojo);">
      <h3 style="color:var(--rojo);">Zona de riesgo</h3>
      <p style="color:var(--gris);">
        Usá esto solo si necesitás empezar el evento completamente de cero (borra puntajes,
        preguntas y canciones agregadas y vuelve a los datos de ejemplo).
      </p>
      <button class="btn btn-rojo" data-action="config-reset-all">REINICIAR TODO</button>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
