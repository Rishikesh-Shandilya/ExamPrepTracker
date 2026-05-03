import { DOM_IDS } from "../constants.js";
import { getRequiredElement } from "../utils.js";

let searchReady = false;

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
