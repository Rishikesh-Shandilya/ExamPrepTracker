import { DOM_IDS } from "../constants.js";
import { getRequiredElement } from "../utils.js";

let progressChart;

// Owns the Chart.js instance so dashboards can re-render without leaking charts.
export function renderChart(subjectProgress) {
  const ctx = getRequiredElement(DOM_IDS.progressChart);
  const labels = Object.keys(subjectProgress);
  const values = Object.values(subjectProgress);

  if (!window.Chart) {
    console.warn("Chart.js is unavailable; skipping chart render.");
    return;
  }

  if (progressChart) {
    progressChart.destroy();
  }

  progressChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Completion %",
          data: values
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}
