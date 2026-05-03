import { DOM_IDS } from "../constants.js";
import { addDiaryEntry, getCurrentDiaryEntries, removeDiaryEntry } from "../state.js";
import { escapeHtml, getRequiredElement } from "../utils.js";

export function setupDiary({ onChange }) {
  getRequiredElement(DOM_IDS.diaryForm).addEventListener("submit", event => {
    event.preventDefault();

    addDiaryEntry({
      mood: getRequiredElement(DOM_IDS.diaryMood).value,
      text: getRequiredElement(DOM_IDS.diaryText).value.trim()
    });

    event.target.reset();
    renderDiaryEntries();
    onChange?.();
  });

  getRequiredElement(DOM_IDS.diaryContainer).addEventListener("click", event => {
    const button = event.target.closest("[data-delete-diary]");

    if (!button) return;

    removeDiaryEntry(button.dataset.deleteDiary);
    renderDiaryEntries();
    onChange?.();
  });
}

export function renderDiaryEntries() {
  const container = getRequiredElement(DOM_IDS.diaryContainer);
  const entries = getCurrentDiaryEntries();

  container.innerHTML = entries.length
    ? entries.map(renderDiaryCard).join("")
    : `<p class="empty-state">No diary entries yet.</p>`;
}

function renderDiaryCard(entry) {
  const date = new Date(entry.createdAt).toLocaleString();

  return `
    <article class="entry-card">
      <div>
        <strong>${escapeHtml(entry.mood)} · ${escapeHtml(date)}</strong>
        <p>${escapeHtml(entry.text)}</p>
      </div>
      <button type="button" data-delete-diary="${entry.id}" aria-label="Delete diary entry">Delete</button>
    </article>
  `;
}
