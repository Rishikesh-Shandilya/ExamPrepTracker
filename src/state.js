import { TRACKING_FIELDS } from "./constants.js";
import { DEFAULT_EXAM_ID } from "./data/exams.js";
import { createId } from "./utils.js";

export const appState = {
  customExams: [],
  customSyllabusByExam: {},
  diaryByExam: {},
  mocksByExam: {},
  preloadedExams: [],
  progressByExam: {},
  pyqByExam: {},
  selectedExamId: DEFAULT_EXAM_ID,
  currentSubject: "",
  currentWorkspace: "syllabus"
};

let currentUser = null;

export function initializeExamCatalog(exams) {
  appState.preloadedExams = exams;

  if (!appState.currentSubject) {
    appState.currentSubject = getFirstSubject(exams[0]?.syllabus || {});
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
}

export function getAvailableExams() {
  return [
    ...appState.preloadedExams,
    ...appState.customExams
  ];
}

export function getSelectedExam() {
  return getAvailableExams().find(exam => exam.id === appState.selectedExamId)
    || appState.preloadedExams[0];
}

export function getSelectedSyllabus() {
  const exam = getSelectedExam();
  const customSyllabus = appState.customSyllabusByExam[exam.id] || {};

  return mergeSyllabus(exam.syllabus, customSyllabus);
}

export function getSelectedExamTrackingFields() {
  return getSelectedExam().trackingFields || TRACKING_FIELDS;
}

export function selectExam(examId) {
  const exam = getAvailableExams().find(item => item.id === examId);

  if (!exam) {
    throw new Error(`Unknown exam selected: ${examId}`);
  }

  appState.selectedExamId = exam.id;
  appState.currentSubject = getFirstSubject(getSelectedSyllabus());
  ensureExamProgress(exam.id);
  ensureExamCollection(appState.mocksByExam, exam.id);
  ensureExamCollection(appState.pyqByExam, exam.id);
  ensureExamCollection(appState.diaryByExam, exam.id);

  return exam;
}

export function getCurrentSubject() {
  return appState.currentSubject;
}

export function setCurrentSubject(subject) {
  appState.currentSubject = subject;
}

export function createEmptyTopicState() {
  return getSelectedExamTrackingFields().reduce((topicState, field) => {
    topicState[field.key] = false;
    return topicState;
  }, {
    remarks: ""
  });
}

export function ensureTopicState(id) {
  const progressState = getCurrentProgressState();

  if (!progressState[id]) {
    progressState[id] = createEmptyTopicState();
  }

  return progressState[id];
}

export function getCurrentProgressState() {
  return ensureExamProgress(getSelectedExam().id);
}

export function getCurrentMockTests() {
  return ensureExamCollection(appState.mocksByExam, getSelectedExam().id);
}

export function getCurrentPyqAttempts() {
  return ensureExamCollection(appState.pyqByExam, getSelectedExam().id);
}

export function getCurrentDiaryEntries() {
  return ensureExamCollection(appState.diaryByExam, getSelectedExam().id);
}

export function getCurrentWorkspace() {
  return appState.currentWorkspace;
}

export function setCurrentWorkspace(workspace) {
  appState.currentWorkspace = workspace;
}

export function clearState() {
  appState.customExams = [];
  appState.customSyllabusByExam = {};
  appState.progressByExam = {};
  appState.mocksByExam = {};
  appState.pyqByExam = {};
  appState.diaryByExam = {};
  appState.selectedExamId = DEFAULT_EXAM_ID;
  appState.currentSubject = getFirstSubject(appState.preloadedExams[0]?.syllabus || {});
  appState.currentWorkspace = "syllabus";
}

export function replaceState(nextState = {}) {
  const normalizedState = normalizeStoredState(nextState);

  appState.progressByExam = normalizedState.progressByExam;
  appState.mocksByExam = normalizedState.mocksByExam;
  appState.pyqByExam = normalizedState.pyqByExam;
  appState.diaryByExam = normalizedState.diaryByExam;
  appState.customExams = normalizedState.customExams;
  appState.customSyllabusByExam = normalizedState.customSyllabusByExam;

  try {
    selectExam(normalizedState.selectedExamId);
  }
  catch(error) {
    console.warn(error.message);
    selectExam(DEFAULT_EXAM_ID);
  }
}

export function serializeState() {
  return {
    selectedExamId: getSelectedExam().id,
    customExams: appState.customExams,
    customSyllabusByExam: appState.customSyllabusByExam,
    diaryByExam: appState.diaryByExam,
    mocksByExam: appState.mocksByExam,
    pyqByExam: appState.pyqByExam,
    progressByExam: appState.progressByExam
  };
}

export function addCustomExam(exam) {
  if (!exam?.id || !exam?.name) {
    throw new Error("Custom tracker must include a name.");
  }

  if (appState.preloadedExams.some(item => item.id === exam.id)) {
    throw new Error("A preloaded tracker already uses this name.");
  }

  const customExam = {
    title: `${exam.name} Preparation Tracker`,
    subtitle: "Personal preparation workspace",
    category: "Personal",
    source: "custom",
    syllabus: {},
    ...exam
  };

  customExam.trackingFields = normalizeTrackingFields(customExam.trackingFields);

  appState.customExams = [
    ...appState.customExams.filter(item => item.id !== customExam.id),
    customExam
  ];

  ensureExamProgress(customExam.id);

  return customExam;
}

export function addCustomTopic({ subject, section, topic }) {
  const exam = getSelectedExam();
  const customSyllabus = appState.customSyllabusByExam[exam.id] || {};

  if (!customSyllabus[subject]) {
    customSyllabus[subject] = {};
  }

  if (!customSyllabus[subject][section]) {
    customSyllabus[subject][section] = [];
  }

  if (!customSyllabus[subject][section].includes(topic)) {
    customSyllabus[subject][section].push(topic);
  }

  appState.customSyllabusByExam[exam.id] = customSyllabus;
  appState.currentSubject = subject;
}

export function updateTopicField(id, field, value) {
  const validFields = new Set([
    ...getSelectedExamTrackingFields().map(item => item.key),
    "remarks"
  ]);

  if (!validFields.has(field)) {
    throw new Error(`Unknown topic progress field: ${field}`);
  }

  const topicState = ensureTopicState(id);
  topicState[field] = value;

  return topicState;
}

export function addMockTest(test) {
  getCurrentMockTests().unshift({
    id: createId("mock"),
    createdAt: new Date().toISOString(),
    ...test
  });
}

export function removeMockTest(id) {
  removeItemById(getCurrentMockTests(), id);
}

export function addPyqAttempt(attempt) {
  getCurrentPyqAttempts().unshift({
    id: createId("pyq"),
    createdAt: new Date().toISOString(),
    ...attempt
  });
}

export function removePyqAttempt(id) {
  removeItemById(getCurrentPyqAttempts(), id);
}

export function addDiaryEntry(entry) {
  getCurrentDiaryEntries().unshift({
    id: createId("diary"),
    createdAt: new Date().toISOString(),
    ...entry
  });
}

export function removeDiaryEntry(id) {
  removeItemById(getCurrentDiaryEntries(), id);
}

function ensureExamProgress(examId) {
  if (!appState.progressByExam[examId]) {
    appState.progressByExam[examId] = {};
  }

  return appState.progressByExam[examId];
}

function ensureExamCollection(collection, examId) {
  if (!collection[examId]) {
    collection[examId] = [];
  }

  return collection[examId];
}

function normalizeStoredState(state = {}) {
  if (state.progressByExam) {
    return {
      selectedExamId: state.selectedExamId || DEFAULT_EXAM_ID,
      customExams: Array.isArray(state.customExams) ? state.customExams : [],
      customSyllabusByExam: state.customSyllabusByExam || {},
      diaryByExam: state.diaryByExam || {},
      mocksByExam: state.mocksByExam || {},
      pyqByExam: state.pyqByExam || {},
      progressByExam: state.progressByExam || {}
    };
  }

  return {
    selectedExamId: DEFAULT_EXAM_ID,
    customExams: [],
    customSyllabusByExam: {},
    diaryByExam: {},
    mocksByExam: {},
    pyqByExam: {},
    progressByExam: {
      [DEFAULT_EXAM_ID]: state || {}
    }
  };
}

function mergeSyllabus(baseSyllabus = {}, customSyllabus = {}) {
  const merged = JSON.parse(JSON.stringify(baseSyllabus));

  Object.entries(customSyllabus).forEach(([subject, sections]) => {
    if (!merged[subject]) {
      merged[subject] = {};
    }

    Object.entries(sections).forEach(([section, topics]) => {
      const existingTopics = merged[subject][section] || [];
      merged[subject][section] = [...new Set([...existingTopics, ...topics])];
    });
  });

  return merged;
}

function removeItemById(items, id) {
  const index = items.findIndex(item => item.id === id);

  if (index >= 0) {
    items.splice(index, 1);
  }
}

function getFirstSubject(syllabus) {
  return Object.keys(syllabus)[0] || "";
}

function normalizeTrackingFields(fields = TRACKING_FIELDS) {
  return fields.map(field => {
    if (typeof field === "string") {
      return {
        key: field,
        label: field
      };
    }

    return field;
  });
}
