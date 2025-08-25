document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const vorname  = document.getElementById("vorname").value.trim();
  const nachname = document.getElementById("nachname").value.trim();

  try {
    const response = await fetch("api/register.php", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, password, vorname, nachname })
    });
    const result = await response.json();

    if (result.status === "success") {
      // Nach erfolgreicher Registrierung zum geschützten Dashboard
      window.location.href = "api/dashboard.php";
    } else {
      alert("Registrierung fehlgeschlagen: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Registrierung fehlgeschlagen!");
  }
});
