import { DOM_IDS } from "../constants.js";
import { addCustomTopic } from "../state.js";
import { getRequiredElement } from "../utils.js";

export function setupSyllabusManager({ onTopicAdded }) {
  getRequiredElement(DOM_IDS.customTopicForm).addEventListener("submit", event => {
    event.preventDefault();

    const subject = getRequiredElement(DOM_IDS.customTopicSubject).value.trim();
    const section = getRequiredElement(DOM_IDS.customTopicSection).value.trim();
    const topic = getRequiredElement(DOM_IDS.customTopicName).value.trim();
    const message = getRequiredElement(DOM_IDS.customTopicMessage);

    if (!subject || !section || !topic) {
      message.innerText = "Subject, section, and topic are required.";
      message.className = "form-message error";
      return;
    }

    addCustomTopic({ subject, section, topic });
    event.target.reset();
    message.innerText = "Topic added to your tracker.";
    message.className = "form-message success";
    onTopicAdded?.();
  });
}
