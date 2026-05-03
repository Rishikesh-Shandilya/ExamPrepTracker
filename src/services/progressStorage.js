import { CACHE_KEY } from "../constants.js";
import { firebaseServices } from "../config/firebase.js";

const LEGACY_CACHE_KEY = "gate_da_tracker_cache";

// Saves progress locally first, then syncs to Firestore when a user is signed in.
export async function saveProgress({ user, state }) {
  saveCachedProgress(state);

  if (!user) {
    return { synced: false, source: "local" };
  }

  try {
    const {
      db,
      doc,
      setDoc
    } = firebaseServices;

    await setDoc(
      doc(db, "progress", user.uid),
      state
    );

    return { synced: true, source: "cloud" };
  }
  catch(error) {
    console.error("Firebase Save Error:", error);
    return { synced: false, source: "local", error };
  }
}

// Loads cloud progress first, then falls back to the browser cache.
export async function loadProgress({ user }) {
  const cachedProgress = loadCachedProgress();

  if (!user) {
    return {
      data: cachedProgress,
      source: "local"
    };
  }

  try {
    const {
      db,
      doc,
      getDoc
    } = firebaseServices;

    const docRef = doc(db, "progress", user.uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const cloudProgress = snap.data();
      saveCachedProgress(cloudProgress);

      return {
        data: cloudProgress,
        source: "cloud"
      };
    }

    if (Object.keys(cachedProgress).length > 0) {
      await saveProgress({
        user,
        state: cachedProgress
      });
    }

    return {
      data: cachedProgress,
      source: "local"
    };
  }
  catch(error) {
    console.error("Cloud Load Error:", error);

    return {
      data: cachedProgress,
      source: "local",
      error
    };
  }
}

export function loadCachedProgress() {
  try {
    const storedData =
      localStorage.getItem(CACHE_KEY)
      || localStorage.getItem(LEGACY_CACHE_KEY)
      || "{}";

    return JSON.parse(storedData);
  }
  catch(error) {
    console.error("Local Cache Parse Error:", error);
    clearCachedProgress();
    return {};
  }
}

export function saveCachedProgress(state) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  }
  catch(error) {
    console.error("Local Cache Save Error:", error);
  }
}

export function clearCachedProgress() {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(LEGACY_CACHE_KEY);
}
