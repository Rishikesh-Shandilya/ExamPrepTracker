import { DOM_IDS } from "../constants.js";
import { addPyqAttempt, getCurrentPyqAttempts, removePyqAttempt } from "../state.js";
import { escapeHtml, getRequiredElement } from "../utils.js";

export function setupPyqTracker({ onChange }) {
  getRequiredElement(DOM_IDS.pyqForm).addEventListener("submit", event => {
    event.preventDefault();

    addPyqAttempt({
      name: getRequiredElement(DOM_IDS.pyqName).value.trim(),
      year: getRequiredElement(DOM_IDS.pyqYear).value,
      score: getRequiredElement(DOM_IDS.pyqScore).value.trim(),
      notes: getRequiredElement(DOM_IDS.pyqNotes).value.trim()
    });

    event.target.reset();
    renderPyqAttempts();
    onChange?.();
  });

  getRequiredElement(DOM_IDS.pyqContainer).addEventListener("click", event => {
    const button = event.target.closest("[data-delete-pyq]");

    if (!button) return;

    removePyqAttempt(button.dataset.deletePyq);
    renderPyqAttempts();
    onChange?.();
  });
}

export function renderPyqAttempts() {
  const container = getRequiredElement(DOM_IDS.pyqContainer);
  const attempts = getCurrentPyqAttempts();

  container.innerHTML = attempts.length
    ? attempts.map(renderAttemptCard).join("")
    : `<p class="empty-state">No PYQ attempts recorded yet.</p>`;
}

function renderAttemptCard(attempt) {
  return `
    <article class="entry-card">
      <div>
        <strong>${escapeHtml(attempt.name)}</strong>
        <span>${escapeHtml(attempt.year)}${attempt.score ? ` · ${escapeHtml(attempt.score)}` : ""}</span>
        ${attempt.notes ? `<p>${escapeHtml(attempt.notes)}</p>` : ""}
      </div>
      <button type="button" data-delete-pyq="${attempt.id}" aria-label="Delete PYQ attempt">Delete</button>
    </article>
  `;
}
