import { DOM_IDS } from "../constants.js";
import { getAvailableExams } from "../state.js";
import { escapeHtml, getRequiredElement } from "../utils.js";

// Renders the exam picker. Preloaded and future custom exams use the same card UI.
export function renderHome({ onExamSelect }) {
  const container = getRequiredElement(DOM_IDS.examCardsContainer);
  const exams = getAvailableExams();

  container.innerHTML = exams
    .map(exam => {
      return `
        <button class="exam-card" type="button" data-exam-id="${exam.id}">
          <span class="exam-card-tag">${escapeHtml(exam.category)}</span>
          <strong>${escapeHtml(exam.name)}</strong>
          <span>${escapeHtml(exam.subtitle)}</span>
        </button>
      `;
    })
    .join("");

  container.onclick = event => {
    const card = event.target.closest("[data-exam-id]");

    if (!card) return;

    onExamSelect?.(card.dataset.examId);
  };
}
