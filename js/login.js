// js/login.js

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, password }),
    });

    const result = await response.json();

    if (result.status === "success") {
      // Weiterleitung über geschützte PHP-Seite
      window.location.href = "api/dashboard.php";
    } else {
      alert(result.message || "Login fehlgeschlagen.");
    }
  } catch (error) {
    console.error("Login-Fehler:", error);
    alert("Ein Fehler ist aufgetreten!");
  }
});
