/* ============================================================
   FUNCIONES Y DATOS COMPARTIDOS
   ============================================================ */

// Estado inicial del juego, se usa solo la primera vez que se
// abre la app (si /juego todavía no existe en la base de datos).
const ESTADO_INICIAL_JUEGO = {
  estado: "espera",           // espera | jugando | finalizado
  ronda: 1,
  preguntaActualId: "",
  reveladas: [false, false, false, false, false],
  mostrarX: false,
  equipoConControl: 1,
  ganador: "",
  equipos: {
    1: { nombre: "Equipo 1", puntos: 0, fallos: 0 },
    2: { nombre: "Equipo 2", puntos: 0, fallos: 0 }
  }
};

// Preguntas de ejemplo para poder probar la aplicación de
// entrada. Se pueden borrar todas juntas desde la sección
// "Banco de preguntas" con el botón "Borrar preguntas de prueba".
const PREGUNTAS_DE_PRUEBA = {
  demo1: {
    texto: "¿Qué es lo que más se escucha en un recreo del Instituto Amanecer?",
    ronda: 1,
    esDemo: true,
    respuestas: [
      { texto: "Música", puntos: 40 },
      { texto: "Gritos", puntos: 30 },
      { texto: "Risas", puntos: 20 },
      { texto: "Conversaciones", puntos: 10 },
      { texto: "La campana", puntos: 5 }
    ]
  },
  demo2: {
    texto: "Nombrá algo que un alumno se olvida seguido en casa",
    ronda: 1,
    esDemo: true,
    respuestas: [
      { texto: "La carpeta", puntos: 35 },
      { texto: "El almuerzo", puntos: 25 },
      { texto: "La lapicera", puntos: 20 },
      { texto: "El celular", puntos: 15 },
      { texto: "La campera", puntos: 5 }
    ]
  },
  demo3: {
    texto: "¿Qué hace un profesor cuando el curso está muy ruidoso?",
    ronda: 2,
    esDemo: true,
    respuestas: [
      { texto: "Golpea el escritorio", puntos: 38 },
      { texto: "Se queda en silencio esperando", puntos: 28 },
      { texto: "Amenaza con una prueba sorpresa", puntos: 18 },
      { texto: "Llama la atención por el nombre", puntos: 11 },
      { texto: "Apaga las luces", puntos: 5 }
    ]
  }
};

// Asegura que exista un estado de juego y preguntas de ejemplo
// la primera vez que se usa la app. No pisa datos ya cargados.
function asegurarDatosIniciales() {
  db.ref("juego").once("value", (snap) => {
    if (!snap.exists()) {
      db.ref("juego").set(ESTADO_INICIAL_JUEGO);
    }
  });
  db.ref("preguntas").once("value", (snap) => {
    if (!snap.exists()) {
      db.ref("preguntas").set(PREGUNTAS_DE_PRUEBA);
    }
  });
}

function marcarConexion(elemento) {
  db.ref(".info/connected").on("value", (snap) => {
    if (!elemento) return;
    if (snap.val() === true) {
      elemento.textContent = "Conectado en tiempo real";
      elemento.classList.remove("mal");
    } else {
      elemento.textContent = "Sin conexión...";
      elemento.classList.add("mal");
    }
  });
}

function escaparHtml(texto) {
  const d = document.createElement("div");
  d.textContent = texto == null ? "" : String(texto);
  return d.innerHTML;
}
