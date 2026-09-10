// Módulo compartido por publico.html, admin.html y unirse.html.
// Se importa Firebase directamente desde los CDN oficiales de Google
// (no hace falta instalar nada ni usar npm).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { seedState } from "./seed-data.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const liveDocRef = doc(db, "live", "estado");

let yaInicializado = false;

/**
 * Se suscribe en tiempo real al documento único de estado.
 * callback(state) se llama cada vez que algo cambia (en cualquier
 * dispositivo). Devuelve una función para cancelar la suscripción.
 */
export function subscribeState(callback, onError) {
  return onSnapshot(
    liveDocRef,
    async (snap) => {
      if (!snap.exists() && !yaInicializado) {
        yaInicializado = true;
        try {
          await setDoc(liveDocRef, seedState);
        } catch (e) {
          onError && onError(e);
        }
        return; // el propio setDoc va a disparar este listener de nuevo
      }
      callback(snap.data());
    },
    (err) => {
      onError && onError(err);
    }
  );
}

/** Actualiza el estado. Hace merge profundo: solo mandá lo que cambió. */
export async function updateState(partial) {
  await setDoc(liveDocRef, partial, { merge: true });
}

/** Borra todo y vuelve a los datos de ejemplo. */
export async function resetAll() {
  await setDoc(liveDocRef, seedState);
}

/** Lectura puntual (no reactiva), por si hace falta en algún lugar puntual. */
export async function fetchStateOnce() {
  const snap = await getDoc(liveDocRef);
  return snap.exists() ? snap.data() : null;
}
