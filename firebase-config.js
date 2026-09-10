// ============================================================
// CONFIGURACIÓN DE FIREBASE
// Reemplazá estos valores por los de TU proyecto de Firebase.
// Los conseguís en: Firebase Console -> Configuración del proyecto
// -> Tus apps -> ícono "</>" (app web) -> "Config del SDK".
//
// Estos valores NO son secretos (a diferencia de una contraseña):
// están pensados para vivir en el código del navegador. Lo que
// protege tus datos son las Reglas de Firestore (ver firestore.rules).
// ============================================================
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

// Contraseña de acceso al panel de administración (/admin.html).
// Cambiala por la que quieran usar el día del evento.
export const ADMIN_PASSWORD = "amanecer2026";
