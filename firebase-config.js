/* ============================================================
   CONFIGURACIÓN DE FIREBASE
   ============================================================
   Reemplazá los valores de abajo por los de TU proyecto de
   Firebase. Las instrucciones completas para crear el proyecto
   están en el archivo LEEME.md, sección "Configurar Firebase".

   Estos datos NO son secretos (son las claves públicas de un
   proyecto web de Firebase), podés dejarlos en el código.
   ============================================================ */

const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "PEGA_AQUI_TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://PEGA_AQUI_TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "PEGA_AQUI_TU_PROYECTO",
  storageBucket: "PEGA_AQUI_TU_PROYECTO.appspot.com",
  messagingSenderId: "000000000000",
  appId: "PEGA_AQUI_TU_APP_ID"
};

// Inicializa Firebase (se carga firebase-app-compat.js y
// firebase-database-compat.js antes que este archivo en cada HTML).
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
