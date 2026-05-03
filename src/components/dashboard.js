import { DOM_IDS } from "../constants.js";
import { renderChart } from "./progressChart.js";
import {
  getCurrentMockTests,
  getCurrentProgressState,
  getCurrentPyqAttempts,
  getSelectedExam,
  getSelectedExamTrackingFields,
  getSelectedSyllabus
} from "../state.js";
import { generateId, getRequiredElement } from "../utils.js";

// Updates the summary cards and the main completion progress bar.
export function updateDashboard() {
  const stats = calculateOverallStats();
  const progress = stats.requiredChecks
    ? Math.round((stats.completedChecks / stats.requiredChecks) * 100)
    : 0;

  getRequiredElement(DOM_IDS.totalTopics).innerText = stats.total;
  getRequiredElement(DOM_IDS.lectureDone).innerText = stats.lecture || 0;
  getRequiredElement(DOM_IDS.notesDone).innerText = stats.notes || 0;
  getRequiredElement(DOM_IDS.revisionDone).innerText = stats.revision || 0;
  getRequiredElement(DOM_IDS.pyqAttemptsDone).innerText = getCurrentPyqAttempts().length;
  getRequiredElement(DOM_IDS.mockDone).innerText = getCurrentMockTests().length;
  getRequiredElement(DOM_IDS.overallProgress).innerText = `${progress}%`;
  getRequiredElement(DOM_IDS.mainProgressBar).style.width = `${progress}%`;
}

// Renders per-subject progress cards and forwards the same data to Chart.js.
export function renderSubjectProgress() {
  const container = getRequiredElement(DOM_IDS.subjectProgressContainer);
  const syllabus = getSelectedSyllabus();
  const progressData = {};

  container.innerHTML = "";

  Object.keys(syllabus).forEach(subject => {
    const percent = calculateSubjectProgress(subject);
    progressData[subject] = percent;

    container.innerHTML += `
      <div class="subject-card">
        <div class="flex justify-between mb-2">
          <span>${subject}</span>
          <span>${percent}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${percent}%"></div>
        </div>
      </div>
    `;
  });

  renderChart(progressData);
}

function calculateOverallStats() {
  const selectedExam = getSelectedExam();
  const syllabus = getSelectedSyllabus();
  const progressState = getCurrentProgressState();
  const stats = {
    completedChecks: 0,
    requiredChecks: 0,
    total: 0
  };

  getSelectedExamTrackingFields().forEach(field => {
    stats[field.key] = 0;
  });

  Object.keys(syllabus).forEach(subject => {
    Object.keys(syllabus[subject]).forEach(section => {
      syllabus[subject][section].forEach(topic => {
        stats.total++;

        const id = generateId(selectedExam.id, subject, section, topic);
        const topicState = progressState[id];

        getSelectedExamTrackingFields().forEach(field => {
          stats.requiredChecks++;

          if (topicState?.[field.key]) {
            stats[field.key]++;
            stats.completedChecks++;
          }
        });
      });
    });
  });

  return stats;
}

function calculateSubjectProgress(subject) {
  const selectedExam = getSelectedExam();
  const syllabus = getSelectedSyllabus();
  const progressState = getCurrentProgressState();
  let total = 0;
  let completedChecks = 0;
  let requiredChecks = 0;

  Object.keys(syllabus[subject]).forEach(section => {
    syllabus[subject][section].forEach(topic => {
      total++;

      const id = generateId(selectedExam.id, subject, section, topic);

      getSelectedExamTrackingFields().forEach(field => {
        requiredChecks++;

        if (progressState[id]?.[field.key]) {
          completedChecks++;
        }
      });
    });
  });

  return requiredChecks
    ? Math.round((completedChecks / requiredChecks) * 100)
    : 0;
}
