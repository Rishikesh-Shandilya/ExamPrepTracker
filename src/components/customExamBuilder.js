import { DOM_IDS } from "../constants.js";
import { addCustomExam } from "../state.js";
import { getRequiredElement, slugify } from "../utils.js";

export function setupCustomExamBuilder({ onExamCreated }) {
  const form = getRequiredElement(DOM_IDS.customExamForm);

  form.addEventListener("submit", event => {
    event.preventDefault();

    const name = getRequiredElement(DOM_IDS.customExamName).value.trim();
    const category = getRequiredElement(DOM_IDS.customExamCategory).value.trim();
    const message = getRequiredElement(DOM_IDS.customExamMessage);

    try {
      const exam = addCustomExam({
        id: slugify(name),
        name,
        title: `${name} Preparation Tracker`,
        subtitle: "Personal preparation workspace",
        category: category || "Personal",
        syllabus: {}
      });

      form.reset();
      message.innerText = "Tracker created. Add subjects and topics from the syllabus tab.";
      message.className = "form-message success";
      onExamCreated?.(exam);
    }
    catch(error) {
      message.innerText = error.message;
      message.className = "form-message error";
    }
  });
}
