// js/profile.js

async function loadProfile() {
  try {
    const res  = await fetch('api/profile.php', {
      method: 'GET',
      credentials: 'include'
    });
    const result = await res.json();
    if (result.status === 'success') {
      const d = result.data;
      document.getElementById('name').value      = d.name      || '';
      document.getElementById('email').value     = d.email     || '';
      document.getElementById('birthdate').value = d.birthdate || '';
      // Passwort-Feld leer lassen
      document.getElementById('password').value = '';
    } else {
      alert('Fehler beim Laden der Profildaten');
    }
  } catch (err) {
    console.error(err);
    alert('Fehler beim Laden der Profildaten');
  }
}

async function saveProfile() {
  const name      = document.getElementById('name').value.trim();
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;
  const birthdate = document.getElementById('birthdate').value;

  if (!name || !email) {
    alert('Name und E-Mail dürfen nicht leer sein.');
    return;
  }

  const payload = { name, email, password, birthdate };

  try {
    const res    = await fetch('api/profile.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.status === 'success') {
      alert('Profil gespeichert!');
      // Passwort-Feld löschen, damit nicht erneut gesendet
      document.getElementById('password').value = '';
    } else {
      alert(result.message || 'Fehler beim Speichern');
    }
  } catch (err) {
    console.error(err);
    alert('Fehler beim Speichern');
  }
}

document.getElementById('saveBtn').addEventListener('click', saveProfile);
loadProfile();
