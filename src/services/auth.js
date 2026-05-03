import { DOM_IDS } from "../constants.js";
import { firebaseServices } from "../config/firebase.js";
import { setCurrentUser } from "../state.js";
import { getRequiredElement } from "../utils.js";

// Wires Google login/logout and loads the user's saved progress after auth.
export function setupFirebaseAuth({ onAuthenticated, onLoggedOut }) {
  const loginBtn = getRequiredElement(DOM_IDS.loginBtn);
  const logoutBtn = getRequiredElement(DOM_IDS.logoutBtn);

  const {
    auth,
    provider,
    signInWithPopup,
    onAuthStateChanged,
    signOut
  } = firebaseServices;

  loginBtn.addEventListener("click", async () => {
    try {
      loginBtn.disabled = true;
      await signInWithPopup(auth, provider);
    }
    catch(error) {
      console.error("Login Error:", error);
    }
    finally {
      loginBtn.disabled = false;
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      logoutBtn.disabled = true;
      await signOut(auth);
      onLoggedOut?.();
    }
    catch(error) {
      console.error("Logout Error:", error);
    }
    finally {
      logoutBtn.disabled = false;
    }
  });

  onAuthStateChanged(auth, async user => {
    if (user) {
      setCurrentUser(user);
      loginBtn.classList.add("hidden");
      logoutBtn.classList.remove("hidden");
      logoutBtn.classList.add("inline-flex");

      onAuthenticated?.();
      return;
    }

    setCurrentUser(null);
    loginBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    logoutBtn.classList.remove("inline-flex");
  });
}
