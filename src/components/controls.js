import { DOM_IDS } from "../constants.js";
import { getRequiredElement } from "../utils.js";

let searchReady = false;
let themeReady = false;
let exportReady = false;

// Filters visible table rows as the user types in the search box.
export function setupSearch() {
  if (searchReady) return;

  const input = getRequiredElement(DOM_IDS.searchInput);

  input.addEventListener("input", applySearchFilter);

  searchReady = true;
}

export function applySearchFilter() {
  const input = getRequiredElement(DOM_IDS.searchInput);
  const value = input.value.toLowerCase();
  const rows = document.querySelectorAll("tbody tr");

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(value) ? "" : "none";
  });
}

// Keeps theme behavior isolated from app startup and rendering code.
export function setupTheme() {
  if (themeReady) return;

  getRequiredElement(DOM_IDS.themeToggle).addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });

  themeReady = true;
}

// Downloads the current progress object as a JSON backup.
export function setupExport(state) {
  if (exportReady) return;

  getRequiredElement(DOM_IDS.exportBtn).addEventListener("click", () => {
    const blob = new Blob(
      [JSON.stringify(state, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "gate_da_progress.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  exportReady = true;
}
