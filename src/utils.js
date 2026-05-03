// Builds stable storage keys from syllabus labels.
export function generateId(subject, section, topic) {
  return `${subject}_${section}_${topic}`
    .replace(/\s+/g, "_")
    .toLowerCase();
}

export function getRequiredElement(id) {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing required DOM element: #${id}`);
  }

  return element;
}

export function debounce(callback, delay = 300) {
  let timeoutId;

  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

// Keeps user-entered remarks safe when inserted into HTML strings.
export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
