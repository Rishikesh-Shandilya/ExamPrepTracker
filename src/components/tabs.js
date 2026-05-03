import { DOM_IDS } from "../constants.js";
import { getCurrentSubject, setCurrentSubject } from "../state.js";
import { syllabus } from "../data/syllabus.js";
import { getRequiredElement } from "../utils.js";

// Renders subject tabs and notifies the caller when the active subject changes.
export function renderTabs({ onSubjectChange } = {}) {
  const container = getRequiredElement(DOM_IDS.tabsContainer);
  container.innerHTML = "";

  Object.keys(syllabus).forEach(subject => {
    const button = document.createElement("button");

    button.innerText = subject;
    button.className = `tab-btn ${
      getCurrentSubject() === subject
        ? "active"
        : ""
    }`;

    button.onclick = () => {
      setCurrentSubject(subject);
      renderTabs({ onSubjectChange });
      onSubjectChange?.();
    };

    container.appendChild(button);
  });
}
