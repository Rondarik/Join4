/**
 * Navigates back to the previous page in the browser history and sets a local storage item.
 *
 * @return {Promise<void>} This function does not return anything.
 */
async function backToLastPage() {
    localStorage.setItem('startAnimation','true');
    window.history.back();
  }

  /**
   * Initializes the function by including HTML and setting initials.
   *
   * @return {Promise<void>} A promise that resolves when the initialization is complete.
   */
  async function init(){
    await includeHTML();
    setInitials();
  }