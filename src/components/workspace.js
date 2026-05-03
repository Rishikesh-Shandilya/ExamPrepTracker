import { DOM_IDS } from "../constants.js";
import { getCurrentWorkspace, setCurrentWorkspace } from "../state.js";
import { getRequiredElement } from "../utils.js";

const WORKSPACES = ["syllabus", "mocks", "pyqs", "diary"];

export function setupWorkspaceNavigation({ onWorkspaceChange }) {
  const nav = getRequiredElement(DOM_IDS.prepNav);

  nav.addEventListener("click", event => {
    const button = event.target.closest("[data-workspace]");

    if (!button) return;

    setCurrentWorkspace(button.dataset.workspace);
    renderWorkspace();
    onWorkspaceChange?.(button.dataset.workspace);
  });
}

export function renderWorkspace() {
  const currentWorkspace = getCurrentWorkspace();

  document.querySelectorAll("[data-panel]").forEach(panel => {
    panel.classList.toggle("hidden", panel.dataset.panel !== currentWorkspace);
  });

  getRequiredElement(DOM_IDS.prepNav)
    .querySelectorAll("[data-workspace]")
    .forEach(button => {
      button.classList.toggle("active", button.dataset.workspace === currentWorkspace);
    });
}

export function resetWorkspace() {
  setCurrentWorkspace(WORKSPACES[0]);
  renderWorkspace();
}
