// js/profile.js

const authData = await window.ensureAuth();
if (!authData) return;

const profileForm = document.getElementById('profileForm');
const saveBtn     = document.getElementById('saveBtn');
const feedbackEl  = document.createElement('p');
feedbackEl.className = 'feedback';
profileForm.appendChild(feedbackEl);

function showFeedback(message, type) {
  feedbackEl.textContent = message;
  feedbackEl.className   = `feedback ${type}`;
  feedbackEl.style.display = message ? 'block' : 'none';
}

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
      showFeedback('', '');
    } else {
      showFeedback('Fehler beim Laden der Profildaten', 'error');
    }
  } catch (err) {
    console.error(err);
    showFeedback('Fehler beim Laden der Profildaten', 'error');
  }
}

async function saveProfile() {
  const name      = document.getElementById('name').value.trim();
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;
  const birthdate = document.getElementById('birthdate').value;

  if (!name || !email) {
    showFeedback('Name und E-Mail dürfen nicht leer sein.', 'error');
    return;
  }

  const payload = { name, email, password, birthdate };

  showFeedback('', '');
  saveBtn.disabled = true;

  try {
    const res    = await fetch('api/profile.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();

    if (result.status === 'success') {
      showFeedback('Profil gespeichert!', 'success');
      // Passwort-Feld löschen, damit nicht erneut gesendet
      document.getElementById('password').value = '';
    } else {
      showFeedback(result.message || 'Fehler beim Speichern', 'error');
    }
  } catch (err) {
    console.error(err);
    showFeedback('Fehler beim Speichern', 'error');
  } finally {
    saveBtn.disabled = false;
  }
}

saveBtn.addEventListener('click', saveProfile);
loadProfile();
