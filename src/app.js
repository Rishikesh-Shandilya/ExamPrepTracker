import { setupFirebaseAuth } from "./services/auth.js";
import { DOM_IDS } from "./constants.js";
import { applySearchFilter, setupSearch } from "./components/controls.js";
import { setupCustomExamBuilder } from "./components/customExamBuilder.js";
import { setupDiary, renderDiaryEntries } from "./components/diary.js";
import { renderHome } from "./components/home.js";
import { setupMockTests, renderMockTests } from "./components/mockTests.js";
import { setupPyqTracker, renderPyqAttempts } from "./components/pyqTracker.js";
import { setupSyllabusManager } from "./components/syllabusManager.js";
import { renderTabs } from "./components/tabs.js";
import { renderContent, setupTopicTableEvents } from "./components/topicTable.js";
import { renderSubjectProgress, updateDashboard } from "./components/dashboard.js";
import {
  renderWorkspace,
  resetWorkspace,
  setupWorkspaceNavigation
} from "./components/workspace.js";
import { loadPreloadedExams } from "./data/exams.js";
import {
  clearState,
  getCurrentUser,
  getSelectedExam,
  initializeExamCatalog,
  replaceState,
  selectExam,
  serializeState,
  updateTopicField
} from "./state.js";
import {
  clearCachedProgress,
  loadProgress,
  saveCachedProgress,
  saveProgress
} from "./services/progressStorage.js";
import { debounce, getRequiredElement } from "./utils.js";

const debouncedSaveProgress = debounce(persistProgress, 500);
let currentView = "home";

window.addEventListener("DOMContentLoaded", async () => {
  const exams = await loadPreloadedExams();

  initializeExamCatalog(exams);

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
  renderHome({
    onExamSelect: handleExamSelect
  });
  setupCustomExamBuilder({
    onExamCreated: handleCustomExamCreated
  });
  setupNavigation();
  setupSearch();
  setupWorkspaceNavigation({
    onWorkspaceChange: renderJourneyViews
  });
  setupMockTests({
    onChange: persistAndRefresh
  });
  setupPyqTracker({
    onChange: persistAndRefresh
  });
  setupDiary({
    onChange: persistAndRefresh
  });
  setupSyllabusManager({
    onTopicAdded: handleCustomTopicAdded
  });
  setupTopicTableEvents({
    onFieldChange: handleTopicFieldChange,
    onRemarksChange: handleRemarksChange
  });

  showHome();
  window.lucide?.createIcons();
}

async function handleExamSelect(examId) {
  selectExam(examId);
  saveCachedProgress(serializeState());
  await persistProgress();
  resetWorkspace();
  showTracker();
}

async function handleCustomExamCreated(exam) {
  selectExam(exam.id);
  resetWorkspace();
  saveCachedProgress(serializeState());
  await persistProgress();
  renderHome({
    onExamSelect: handleExamSelect
  });
  showTracker();
}

function showHome() {
  currentView = "home";
  document.title = "Exam Prep Tracker";
  getElement(DOM_IDS.appTitleText).innerText = "Exam Prep Tracker";
  getElement(DOM_IDS.examHome).classList.remove("hidden");
  getElement(DOM_IDS.trackerView).classList.add("hidden");
  renderHome({
    onExamSelect: handleExamSelect
  });
}

function showTracker() {
  currentView = "tracker";
  const exam = getSelectedExam();

  document.title = exam.title;
  getElement(DOM_IDS.appTitleText).innerText = exam.title;
  getElement(DOM_IDS.trackerTitle).innerText = exam.title;
  getElement(DOM_IDS.trackerSubtitle).innerText = exam.subtitle;
  getElement(DOM_IDS.examHome).classList.add("hidden");
  getElement(DOM_IDS.trackerView).classList.remove("hidden");

  renderTabs({
    onSubjectChange: renderActiveSubject
  });
  renderWorkspace();
  renderActiveSubject();
  renderJourneyViews();
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

function renderJourneyViews() {
  renderMockTests();
  renderPyqAttempts();
  renderDiaryEntries();
}

function setupNavigation() {
  getElement(DOM_IDS.changeExamBtn).addEventListener("click", showHome);
}

async function handleAuthenticatedUser() {
  const { data } = await loadProgress({
    user: getCurrentUser()
  });

  replaceState(data);

  if (currentView === "tracker") {
    showTracker();
  }
  else {
    showHome();
  }
}

function renderLoggedOutState() {
  clearState();
  clearCachedProgress();
  showHome();
}

async function handleTopicFieldChange({ id, field, value }) {
  updateTopicField(id, field, value);
  await persistAndRefresh();
}

async function handleCustomTopicAdded() {
  await persistProgress();
  renderTabs({
    onSubjectChange: renderActiveSubject
  });
  renderActiveSubject();
  refreshProgressViews();
}

function handleRemarksChange({ id, value }) {
  updateTopicField(id, "remarks", value);
  saveCachedProgress(serializeState());
  debouncedSaveProgress();
}

async function persistProgress() {
  await saveProgress({
    user: getCurrentUser(),
    state: serializeState()
  });
}

async function persistAndRefresh() {
  await persistProgress();
  refreshProgressViews();
}

function getElement(id) {
  return getRequiredElement(id);
}
