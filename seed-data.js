// Estado inicial completo del evento. Se sube UNA sola vez a Firestore
// automáticamente la primera vez que alguien abre la app. A partir de ahí,
// todo se edita desde el panel de administración (admin.html):
// nunca hace falta tocar este archivo para cambiar una pregunta o canción.
export const seedState = {
  currentGame: "home", // 'home' | 'nota' | 'amanecidos' | 'escalones'
  soundEffects: true,

  nota: {
    equipo1: { nombre: "EQUIPO 1", puntaje: 0 },
    equipo2: { nombre: "EQUIPO 2", puntaje: 0 },
    respondiendo: null, // null | 'equipo1' | 'equipo2'
    currentSongIndex: 0,
    isPlaying: false,
    songs: [
      {
        id: "s1",
        titulo: "Canción de ejemplo 1",
        artista: "Artista de ejemplo",
        archivo: "ejemplo1.mp3", // colocar en /audio/
        ronda: 1,
      },
      {
        id: "s2",
        titulo: "Canción de ejemplo 2",
        artista: "Artista de ejemplo",
        archivo: "ejemplo2.mp3",
        ronda: 1,
      },
    ],
  },

  amanecidos: {
    equipo1: { nombre: "EQUIPO 1", puntaje: 0 },
    equipo2: { nombre: "EQUIPO 2", puntaje: 0 },
    currentQuestionIndex: 0,
    revealed: [false, false, false, false, false],
    incorrectX: false,
    questions: [
      {
        id: "q1",
        pregunta: "¿Qué es lo que más se escucha durante un recreo en el Instituto Amanecer?",
        respuestas: [
          { texto: "Respuesta A", puntos: 50 },
          { texto: "Respuesta B", puntos: 40 },
          { texto: "Respuesta C", puntos: 30 },
          { texto: "Respuesta D", puntos: 20 },
          { texto: "Respuesta E", puntos: 10 },
        ],
      },
    ],
  },

  escalones: {
    currentStep: 1,
    currentQuestionIndex: 0,
    lastAnswerResult: null, // null | 'correct' | 'incorrect'
    questions: [
      {
        id: "e1",
        categoria: "Cultura general",
        pregunta: "¿Cuál es el planeta más grande del Sistema Solar?",
        opciones: ["Tierra", "Marte", "Júpiter", "Venus"],
        correcta: 2,
      },
    ],
  },

  participantes: [],
};
