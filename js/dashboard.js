// js/dashboard.js

// aktuelles, ausgewähltes Datum (YYYY-MM-DD)
let selectedDate = new Date().toISOString().slice(0,10);

document.addEventListener('DOMContentLoaded', () => {
  initCalendar();
  loadUsername();
  loadCards();

  // Event-Delegation für Checkboxen
  document.getElementById('medCards').addEventListener('change', async e => {
    if (!e.target.matches('.done-chk')) return;
    const chk    = e.target;
    const medId  = chk.dataset.id;
    const action = chk.checked ? 'done' : 'undo';
    try {
      const res  = await fetch('api/medikamente.php', {
        method: 'PATCH',
        credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ action, id: medId, date: selectedDate })
      });
      const json = await res.json();
      if (json.status !== 'success') throw new Error(json.message||'Fehler');
      window._calendar.refetchEvents();
      loadCards();
    } catch (err) {
      console.error(err);
      alert('Fehler beim Aktualisieren: ' + err.message);
      chk.checked = !chk.checked;
    }
  });
});

async function initCalendar() {
  const calendarEl = document.getElementById('calendar');
  let lastCell = null;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'de',
    height: 400,
    selectable: true,
    displayEventTime: false,
    events: fetchEvents,
    dateClick: info => {
      selectDate(info.dateStr, calendarEl);
      loadCards();
    },
    eventClick: info => {
      const ds = info.event.startStr.slice(0,10);
      selectDate(ds, calendarEl);
      loadCards();
    }
  });

  calendar.render();
  window._calendar = calendar;

  document.getElementById('viewSelector')
    .addEventListener('change', e => calendar.changeView(e.target.value));
}

function selectDate(dateStr, calendarEl) {
  selectedDate = dateStr;
  const prev = calendarEl.querySelector('.fc-day-selected');
  if (prev) prev.classList.remove('fc-day-selected');
  const cell = calendarEl.querySelector(`.fc-daygrid-day[data-date="${dateStr}"]`);
  if (cell) cell.classList.add('fc-day-selected');
}

async function fetchEvents(fetchInfo, successCallback) {
  try {
    const res  = await fetch('api/medikamente.php',{ credentials:'include' });
    const json = await res.json();
    if (json.status!=='success') return successCallback([]);

    const events = [];
    const start  = new Date(fetchInfo.start);
    const end    = new Date(fetchInfo.end);

    json.data.forEach(med => {
      const [hh, mm] = med.time.split(':').map(Number);
      for (let d = new Date(start); d < end; d.setDate(d.getDate()+1)) {
        const Y   = d.getFullYear();
        const M   = String(d.getMonth()+1).padStart(2,'0');
        const D   = String(d.getDate()).padStart(2,'0');
        const iso = `${Y}-${M}-${D}`;

        let show = false;
        if (med.frequency==='täglich') show = true;
        if (med.frequency==='wöchentlich' && d.getDay()===med.weekday) show = true;
        if (med.frequency==='monatlich'  && d.getDate()===new Date().getDate()) show = true;
        if (!show) continue;

        const done  = med.logs.includes(iso);
        const color = done ? '#28a745' : '#3788d8';
        const title = `${med.name} (${med.dosage})`;

        if (med.frequency==='wöchentlich') {
          events.push({ id:med.id, title, start:iso, allDay:true, color, extendedProps:{done} });
        } else {
          const hhStr = String(hh).padStart(2,'0');
          const mmStr = String(mm).padStart(2,'0');
          events.push({
            id:med.id,
            title,
            start:`${iso}T${hhStr}:${mmStr}:00`,
            allDay:false,
            color,
            extendedProps:{done}
          });
        }
      }
    });

    successCallback(events);
  } catch {
    successCallback([]);
  }
}

async function loadUsername() {
  try {
    const res  = await fetch('api/profile.php',{ credentials:'include' });
    const json = await res.json();
    if (json.status === 'success') {
      document.getElementById('username').textContent = json.data.name;
    }
  } catch {}
}

// ---------------------- WICHTIGER TEIL ----------------------
async function loadCards() {
  const container = document.getElementById('medCards');
  container.innerHTML = '';

  try {
    const res  = await fetch('api/medikamente.php',{ credentials:'include' });
    const json = await res.json();
    if (json.status!=='success') return;

    const dateObj = new Date(selectedDate);
    const todayDay = dateObj.getDate();
    const todayWeekday = dateObj.getDay();

    json.data.forEach(med => {
      // Wöchentlich: nur anzeigen, wenn Wochentag passt
      if (med.frequency === 'wöchentlich' && med.weekday !== todayWeekday) {
        return;
      }
      // Optional: bei monatlich nur am selben Tag im Monat anzeigen
      if (med.frequency === 'monatlich' && todayDay !== dateObj.getDate()) {
        return;
      }
      // (Täglich immer angezeigt)

      const done = med.logs.includes(selectedDate);
      const card = document.createElement('div');
      card.className = 'med-card';
      card.innerHTML = `
        <div class="info">
          <strong>${med.name}</strong><br>
          ${med.dosage} – ${med.frequency}
        </div>
        <div class="time">${med.time.slice(0,5)}</div>
        <div>
          <input type="checkbox"
                 class="done-chk"
                 data-id="${med.id}"
                 ${done ? 'checked' : ''}>
        </div>
      `;
      container.appendChild(card);
    });
  } catch {}
}
// -------------------------------------------------------------
