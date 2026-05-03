// Builds stable progress keys from exam and syllabus labels.
export function generateId(examId, subject, section, topic) {
  return `${examId}_${subject}_${section}_${topic}`
    .replace(/\s+/g, "_")
    .replace(/[^\w-]+/g, "_")
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

export function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function createId(prefix = "item") {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
