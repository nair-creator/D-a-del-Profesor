import { subscribeState, updateState } from "./state.js";

const contenido = document.getElementById("contenido");
let enviado = false;

const NOMBRES_JUEGO = {
  home: "Esperando el inicio del acto",
  nota: "🎵 En una Nota",
  amanecidos: "🏆 100 Amanecidos",
  escalones: "🪜 8 Escalones",
};

subscribeState(render, (err) => {
  console.error(err);
  contenido.innerHTML = `<p style="color:var(--rojo);">Error de conexión. Revisá tu Internet.</p>`;
});

function render(state) {
  if (!state) return;

  contenido.innerHTML = `
    <p style="color: var(--gris); letter-spacing: 2px;">INSTITUTO AMANECER</p>
    <h2>DÍA DEL PROFESOR</h2>
    <div class="card" style="margin-top:20px; max-width:380px;">
      <p style="color:var(--gris); margin-bottom:6px;">Dinámica en curso:</p>
      <h3 style="margin:0;">${NOMBRES_JUEGO[state.currentGame] || "—"}</h3>
    </div>

    ${!enviado ? `
      <form id="form-unirse" class="card" style="margin-top:24px; max-width:380px; width:100%;">
        <label>Tu nombre</label>
        <input id="input-nombre" placeholder="Ej: Juan Pérez" />
        <div style="height:12px;"></div>
        <label>Tu equipo (si corresponde)</label>
        <select id="select-equipo">
          <option value="equipo1">Equipo 1</option>
          <option value="equipo2">Equipo 2</option>
          <option value="ninguno">No participo en equipos</option>
        </select>
        <div style="height:16px;"></div>
        <button class="btn btn-dorado" type="submit" style="width:100%;">Anotarme</button>
      </form>
    ` : `
      <p id="mensaje-ok" style="margin-top:24px; color:var(--verde); font-weight:700;"></p>
    `}
  `;

  const form = document.getElementById("form-unirse");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("input-nombre").value.trim();
      const equipo = document.getElementById("select-equipo").value;
      if (!nombre) return;
      const participantes = state.participantes || [];
      await updateState({ participantes: [...participantes, { nombre, equipo, ts: Date.now() }] });
      enviado = true;
      render(state);
      const msg = document.getElementById("mensaje-ok");
      if (msg) msg.textContent = `¡Listo, ${nombre}! Ya estás anotado. Seguí la pantalla del proyector.`;
    });
  }
}
