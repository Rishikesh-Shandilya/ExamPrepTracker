import { DOM_IDS } from "../constants.js";
import { syllabus } from "../data/syllabus.js";
import { renderChart } from "./progressChart.js";
import { progressState } from "../state.js";
import { generateId, getRequiredElement } from "../utils.js";

// Updates the summary cards and the main completion progress bar.
export function updateDashboard() {
  const stats = calculateOverallStats();
  const progress = stats.total
    ? Math.round((stats.lecture / stats.total) * 100)
    : 0;

  getRequiredElement(DOM_IDS.totalTopics).innerText = stats.total;
  getRequiredElement(DOM_IDS.lectureDone).innerText = stats.lecture;
  getRequiredElement(DOM_IDS.revisionDone).innerText = stats.revision;
  getRequiredElement(DOM_IDS.pyqDone).innerText = stats.pyq;
  getRequiredElement(DOM_IDS.testDone).innerText = stats.test;
  getRequiredElement(DOM_IDS.overallProgress).innerText = `${progress}%`;
  getRequiredElement(DOM_IDS.mainProgressBar).style.width = `${progress}%`;
}

// Renders per-subject progress cards and forwards the same data to Chart.js.
export function renderSubjectProgress() {
  const container = getRequiredElement(DOM_IDS.subjectProgressContainer);
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
  const stats = {
    total: 0,
    lecture: 0,
    revision: 0,
    pyq: 0,
    test: 0
  };

  Object.keys(syllabus).forEach(subject => {
    Object.keys(syllabus[subject]).forEach(section => {
      syllabus[subject][section].forEach(topic => {
        stats.total++;

        const id = generateId(subject, section, topic);
        const topicState = progressState[id];

        if (!topicState) return;

        if (topicState.lecture) stats.lecture++;
        if (topicState.revision) stats.revision++;
        if (topicState.pyq) stats.pyq++;
        if (topicState.test) stats.test++;
      });
    });
  });

  return stats;
}

function calculateSubjectProgress(subject) {
  let total = 0;
  let completed = 0;

  Object.keys(syllabus[subject]).forEach(section => {
    syllabus[subject][section].forEach(topic => {
      total++;

      const id = generateId(subject, section, topic);

      if (progressState[id]?.lecture) {
        completed++;
      }
    });
  });

  return total
    ? Math.round((completed / total) * 100)
    : 0;
}
