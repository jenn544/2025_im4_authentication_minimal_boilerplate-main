// js/medikamente.js
document.addEventListener('DOMContentLoaded', () => {
  const freq    = document.getElementById('frequency');
  const wLabel  = document.getElementById('weekdayLabel');
  const wSelect = document.getElementById('weekday');
  const form    = document.getElementById('medForm');
  const list    = document.getElementById('medList');

  // 1) Toggle Wochentag-Feld
  function toggleWeekday() {
    const show = freq.value === 'wöchentlich';
    wLabel.style.display  = show ? 'block' : 'none';
    wSelect.style.display = show ? 'block' : 'none';
  }
  freq.addEventListener('change', toggleWeekday);
  toggleWeekday();

  // 2) Laden der Medikamente
  async function loadMeds() {
    try {
      const res  = await fetch('api/medikamente.php', {
        credentials: 'include'
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message || 'Lade fehlgeschlagen');

      list.innerHTML = '';
      json.data.forEach(med => {
        const div = document.createElement('div');
        div.className = 'med-list-item';
        div.innerHTML = `
          <div class="info">
            <strong>${med.name}</strong><br>
            ${med.dosage} – ${med.frequency}<br>
            ${med.time.slice(0,5)}
          </div>
          <button class="secondary" data-id="${med.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        `;
        list.appendChild(div);

        div.querySelector('.secondary').addEventListener('click', async () => {
          await fetch(`api/medikamente.php?id=${med.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          loadMeds();
        });
      });
    } catch (err) {
      console.error(err);
      list.innerHTML = `<p style="color:white;">${err.message}</p>`;
    }
  }

  // 3) Formular-Submit
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      name:      document.getElementById('name').value.trim(),
      dosage:    document.getElementById('dosage').value.trim(),
      frequency: freq.value,
      time:      document.getElementById('time').value,
      weekday:   freq.value === 'wöchentlich' ? parseInt(wSelect.value) : null
    };

    try {
      const res  = await fetch('api/medikamente.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message);

      form.reset();
      toggleWeekday();
      loadMeds();
    } catch (err) {
      console.error(err);
      alert('Fehler: ' + err.message);
    }
  });

  // initial
  loadMeds();
});
