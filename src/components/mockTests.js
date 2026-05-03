import { DOM_IDS } from "../constants.js";
import { addMockTest, getCurrentMockTests, removeMockTest } from "../state.js";
import { escapeHtml, getRequiredElement } from "../utils.js";

export function setupMockTests({ onChange }) {
  getRequiredElement(DOM_IDS.mockForm).addEventListener("submit", event => {
    event.preventDefault();

    addMockTest({
      name: getRequiredElement(DOM_IDS.mockName).value.trim(),
      date: getRequiredElement(DOM_IDS.mockDate).value,
      score: Number(getRequiredElement(DOM_IDS.mockScore).value),
      total: Number(getRequiredElement(DOM_IDS.mockTotal).value),
      notes: getRequiredElement(DOM_IDS.mockNotes).value.trim()
    });

    event.target.reset();
    renderMockTests({ onChange });
    onChange?.();
  });

  getRequiredElement(DOM_IDS.mockContainer).addEventListener("click", event => {
    const button = event.target.closest("[data-delete-mock]");

    if (!button) return;

    removeMockTest(button.dataset.deleteMock);
    renderMockTests({ onChange });
    onChange?.();
  });
}

export function renderMockTests() {
  const container = getRequiredElement(DOM_IDS.mockContainer);
  const mockTests = getCurrentMockTests();

  container.innerHTML = mockTests.length
    ? mockTests.map(renderMockCard).join("")
    : `<p class="empty-state">No mock tests recorded yet.</p>`;
}

function renderMockCard(test) {
  const percent = test.total ? Math.round((test.score / test.total) * 100) : 0;

  return `
    <article class="entry-card">
      <div>
        <strong>${escapeHtml(test.name)}</strong>
        <span>${escapeHtml(test.date)} · ${test.score}/${test.total} · ${percent}%</span>
        ${test.notes ? `<p>${escapeHtml(test.notes)}</p>` : ""}
      </div>
      <button type="button" data-delete-mock="${test.id}" aria-label="Delete mock test">Delete</button>
    </article>
  `;
}
