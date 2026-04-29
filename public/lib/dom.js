export const byId = (id) => document.getElementById(id);

export const setText = (id, value) => {
  const element = byId(id);
  if (!element) return;
  element.textContent = value;
};

export const showError = (id, message) => {
  const element = byId(id);
  if (!element) return;
  element.textContent = message;
  element.style.display = "block";
};

export const clearError = (id) => {
  const element = byId(id);
  if (!element) return;
  element.textContent = "";
  element.style.display = "none";
};

export const toggleDisabled = (element, disabled) => {
  if (element) {
    element.disabled = Boolean(disabled);
  }
};
