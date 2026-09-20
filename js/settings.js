import { getSettings, setSettings } from "./storage.js";
import { byId } from "./ui.js";

const directionSelect = byId("defaultDirection");
const modeSelect = byId("defaultMode");
const countInput = byId("defaultCount");
const saveBtn = byId("saveBtn");
const typingModeOption = byId("defaultTypingModeOption");
const mixedModeOption = byId("defaultMixedModeOption");

const updateModeAvailability = () => {
  const isWordToMeaning = directionSelect.value === "word-to-meaning";
  typingModeOption.disabled = isWordToMeaning;
  mixedModeOption.disabled = isWordToMeaning;
  if (isWordToMeaning && modeSelect.value !== "choice") {
    modeSelect.value = "choice";
  }
};

const init = () => {
  const currentSettings = getSettings();
  directionSelect.value = currentSettings.direction || "word-to-meaning";
  modeSelect.value = currentSettings.mode || "choice";
  countInput.value = currentSettings.count || 20;
  updateModeAvailability();
};

directionSelect.addEventListener("change", updateModeAvailability);
saveBtn.addEventListener("click", () => {
  let countVal = Number(countInput.value) || 20;
  if (countVal > 400) {
    countVal = 400;
    countInput.value = 400;
  }

  const newSettings = {
    direction: directionSelect.value,
    mode: modeSelect.value,
    count: countVal,
  };

  setSettings(newSettings);
  alert("기본 설정이 저장되었습니다.");
});

init();
