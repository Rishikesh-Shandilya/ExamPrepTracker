import { DOM_IDS, TRACKING_FIELDS } from "../constants.js";
import { syllabus } from "../data/syllabus.js";
import { getCurrentSubject, ensureTopicState, progressState } from "../state.js";
import { escapeHtml, generateId, getRequiredElement } from "../utils.js";

let tableEventsReady = false;

// Builds the active subject's topic table from the syllabus data.
export function renderContent() {
  const container = getRequiredElement(DOM_IDS.contentContainer);
  const currentSubject = getCurrentSubject();
  const sections = syllabus[currentSubject];

  let html = `
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-auto">
      <table class="topic-table">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Lecture</th>
            <th>Notes</th>
            <th>Revision</th>
            <th>PYQ</th>
            <th>Test</th>
            <th>Weak</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
  `;

  Object.keys(sections).forEach(section => {
    html += `
      <tr>
        <td colspan="8" class="bg-zinc-800 text-amber-400 font-semibold">
          ${escapeHtml(section)}
        </td>
      </tr>
    `;

    sections[section].forEach(topic => {
      const id = generateId(currentSubject, section, topic);
      ensureTopicState(id);

      html += `
        <tr>
          <td>${escapeHtml(topic)}</td>
          ${renderTrackingCells(id)}
          <td>
            <textarea
              rows="2"
              data-topic-id="${id}"
              data-field="remarks"
              class="bg-zinc-800 border border-zinc-700 rounded-lg p-2 w-full text-sm"
              placeholder="Add remarks..."
            >${escapeHtml(progressState[id].remarks || "")}</textarea>
          </td>
        </tr>
      `;
    });
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

// Uses event delegation so re-rendered table rows do not need inline handlers.
export function setupTopicTableEvents({ onFieldChange, onRemarksChange }) {
  if (tableEventsReady) return;

  const container = getRequiredElement(DOM_IDS.contentContainer);

  container.addEventListener("change", event => {
    const target = event.target;

    if (!target.matches("input[type='checkbox'][data-topic-id]")) return;

    onFieldChange?.({
      id: target.dataset.topicId,
      field: target.dataset.field,
      value: target.checked
    });
  });

  container.addEventListener("input", event => {
    const target = event.target;

    if (!target.matches("textarea[data-topic-id][data-field='remarks']")) {
      return;
    }

    onRemarksChange?.({
      id: target.dataset.topicId,
      value: target.value
    });
  });

  tableEventsReady = true;
}

function renderTrackingCells(id) {
  return TRACKING_FIELDS
    .map(field => {
      return `
        <td>
          <input
            type="checkbox"
            data-topic-id="${id}"
            data-field="${field}"
            ${progressState[id][field] ? "checked" : ""}
          >
        </td>
      `;
    })
    .join("");
}
