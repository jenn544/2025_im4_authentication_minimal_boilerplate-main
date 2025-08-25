// js/login.js

const loginForm  = document.getElementById("loginForm");
const submitBtn  = loginForm.querySelector('button[type="submit"]');
const feedbackEl = document.createElement('p');
feedbackEl.className = 'feedback';
loginForm.appendChild(feedbackEl);

function showFeedback(message, type) {
  feedbackEl.textContent = message;
  feedbackEl.className   = `feedback ${type}`;
  feedbackEl.style.display = message ? 'block' : 'none';
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  showFeedback('', '');
  submitBtn.disabled = true;

  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, password }),
    });

    const result = await response.json();

    if (result.status === "success") {
      showFeedback('Erfolgreich angemeldet!', 'success');
      submitBtn.disabled = false;
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 500);
    } else {
      showFeedback(result.message || "Login fehlgeschlagen.", 'error');
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error("Login-Fehler:", error);
    showFeedback("Ein Fehler ist aufgetreten!", 'error');
    submitBtn.disabled = false;
  }
});
