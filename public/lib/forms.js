import { clearError, showError, toggleDisabled } from "./dom.js";

export const wireAsyncForm = ({ form, errorId, onSubmit }) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError(errorId);

    const submitButton = form.querySelector('button[type="submit"]');
    toggleDisabled(submitButton, true);

    try {
      await onSubmit(event);
    } catch (error) {
      showError(errorId, error.message || "Something went wrong.");
    } finally {
      toggleDisabled(submitButton, false);
    }
  });
};
