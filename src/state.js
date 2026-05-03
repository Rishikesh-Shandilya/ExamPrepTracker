import { TRACKING_FIELDS } from "./constants.js";
import { syllabus } from "./data/syllabus.js";

// Centralizes mutable app state so components do not own global variables.
export const progressState = {};

const VALID_TOPIC_FIELDS = new Set([
  ...TRACKING_FIELDS,
  "remarks"
]);

let currentUser = null;
let currentSubject = Object.keys(syllabus)[0];

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
}

export function getCurrentSubject() {
  return currentSubject;
}

export function setCurrentSubject(subject) {
  currentSubject = subject;
}

export function createEmptyTopicState() {
  return {
    lecture: false,
    notes: false,
    revision: false,
    pyq: false,
    test: false,
    weak: false,
    remarks: ""
  };
}

export function ensureTopicState(id) {
  if (!progressState[id]) {
    progressState[id] = createEmptyTopicState();
  }

  return progressState[id];
}

export function clearState() {
  Object.keys(progressState).forEach(key => {
    delete progressState[key];
  });
}

export function replaceState(nextState = {}) {
  clearState();
  Object.assign(progressState, nextState);
}

export function updateTopicField(id, field, value) {
  if (!VALID_TOPIC_FIELDS.has(field)) {
    throw new Error(`Unknown topic progress field: ${field}`);
  }

  const topicState = ensureTopicState(id);
  topicState[field] = value;

  return topicState;
}
