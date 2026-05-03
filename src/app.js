import { setupFirebaseAuth } from "./services/auth.js";
import {
  applySearchFilter,
  setupExport,
  setupSearch,
  setupTheme
} from "./components/controls.js";
import { renderTabs } from "./components/tabs.js";
import { renderContent, setupTopicTableEvents } from "./components/topicTable.js";
import { renderSubjectProgress, updateDashboard } from "./components/dashboard.js";
import {
  clearState,
  getCurrentUser,
  progressState,
  replaceState,
  updateTopicField
} from "./state.js";
import {
  clearCachedProgress,
  loadProgress,
  saveCachedProgress,
  saveProgress
} from "./services/progressStorage.js";
import { debounce } from "./utils.js";

const debouncedSaveProgress = debounce(persistProgress, 500);

window.addEventListener("DOMContentLoaded", async () => {
  const { data } = await loadProgress({
    user: null
  });

  replaceState(data);
  initializeApp();

  setupFirebaseAuth({
    onAuthenticated: handleAuthenticatedUser,
    onLoggedOut: renderLoggedOutState
  });
});

function initializeApp() {
  renderTabs({
    onSubjectChange: renderActiveSubject
  });

  setupSearch();
  setupTheme();
  setupExport(progressState);
  setupTopicTableEvents({
    onFieldChange: handleTopicFieldChange,
    onRemarksChange: handleRemarksChange
  });

  renderActiveSubject();
  refreshProgressViews();
  window.lucide?.createIcons();
}

function renderActiveSubject() {
  renderContent();
  applySearchFilter();
}

function refreshProgressViews() {
  updateDashboard();
  renderSubjectProgress();
}

async function handleAuthenticatedUser() {
  const { data } = await loadProgress({
    user: getCurrentUser()
  });

  replaceState(data);
  renderActiveSubject();
  refreshProgressViews();
}

function renderLoggedOutState() {
  clearState();
  clearCachedProgress();
  renderActiveSubject();
  refreshProgressViews();
}

async function handleTopicFieldChange({ id, field, value }) {
  updateTopicField(id, field, value);
  await persistProgress();
  refreshProgressViews();
}

function handleRemarksChange({ id, value }) {
  updateTopicField(id, "remarks", value);
  saveCachedProgress(progressState);
  debouncedSaveProgress();
}

async function persistProgress() {
  await saveProgress({
    user: getCurrentUser(),
    state: progressState
  });
}
