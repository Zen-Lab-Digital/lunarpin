/**
 * Lunar Pin — Interacción y Visualización de Cliente (Vanilla JS ES6+)
 * Compatible tanto con HTTP/HTTPS como con apertura directa local (file://).
 */

// Constantes astronómicas
const SYNODIC_MONTH = 29.53058770576;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);
const ANOMALISTIC_MONTH = 27.554549878;
const KNOWN_PERIGEE = Date.UTC(2000, 0, 4, 21, 0, 0);
const MEAN_DISTANCE_KM = 384400;
const ORBIT_ECCENTRICITY = 0.0549;
const ZODIAC_SIGNS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

/**
 * Calcula la fase lunar para una fecha dada.
 */
function calculateMoonPhase(targetDate = new Date()) {
  const date = (targetDate instanceof Date && !isNaN(targetDate)) ? targetDate : new Date();
  const timeMs = date.getTime();
  const diffDays = (timeMs - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);

  let cycles = diffDays / SYNODIC_MONTH;
  let fraction = cycles - Math.floor(cycles);
  if (fraction < 0) fraction += 1;

  const age = Math.round(fraction * SYNODIC_MONTH * 10) / 10;
  const phaseAngle = fraction * 2 * Math.PI;
  const illumination = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100);

  let phaseName = '';
  let phaseEmoji = '';

  if (fraction < 0.03 || fraction > 0.97) {
    phaseName = 'Luna Nueva';
    phaseEmoji = '🌑';
  } else if (fraction < 0.22) {
    phaseName = 'Creciente Iluminante';
    phaseEmoji = '🌒';
  } else if (fraction < 0.28) {
    phaseName = 'Cuarto Creciente';
    phaseEmoji = '🌓';
  } else if (fraction < 0.47) {
    phaseName = 'Gibosa Creciente';
    phaseEmoji = '🌔';
  } else if (fraction < 0.53) {
    phaseName = 'Luna Llena';
    phaseEmoji = '🌕';
  } else if (fraction < 0.72) {
    phaseName = 'Gibosa Menguante';
    phaseEmoji = '🌖';
  } else if (fraction < 0.78) {
    phaseName = 'Cuarto Menguante';
    phaseEmoji = '🌗';
  } else {
    phaseName = 'Luna Menguante';
    phaseEmoji = '🌘';
  }

  const j2000Days = (timeMs - Date.UTC(2000, 0, 1, 12, 0, 0)) / (1000 * 60 * 60 * 24);
  const sunLong = (280.460 + 0.9856474 * j2000Days) % 360;
  let moonLong = (sunLong + fraction * 360) % 360;
  if (moonLong < 0) moonLong += 360;
  const signIndex = Math.floor(moonLong / 30) % 12;
  const zodiac = ZODIAC_SIGNS[signIndex];

  const daysSincePerigee = (timeMs - KNOWN_PERIGEE) / (1000 * 60 * 60 * 24);
  const anomalyCycles = daysSincePerigee / ANOMALISTIC_MONTH;
  const meanAnomaly = (anomalyCycles - Math.floor(anomalyCycles)) * 2 * Math.PI;
  const distanceKm = Math.round(MEAN_DISTANCE_KM * (1 - ORBIT_ECCENTRICITY * Math.cos(meanAnomaly)));

  return {
    date: date.toISOString().split('T')[0],
    phaseName,
    phaseEmoji,
    age,
    illumination,
    fraction: Math.round(fraction * 1000) / 1000,
    zodiac,
    distanceKm
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initLunarDisplay();
  initDateControls();
  initDynamicStars();
});

function updateLunarView(date = new Date()) {
  const moon = calculateMoonPhase(date);

  const phaseNameEl = document.getElementById('lunarPhaseName');
  const illuminationEl = document.getElementById('lunarIllumination');
  const ageEl = document.getElementById('lunarAge');
  const zodiacEl = document.getElementById('lunarZodiac');
  const distanceEl = document.getElementById('lunarDistance');
  const zodiacBadgeEl = document.getElementById('lunarZodiacBadge');
  const tagDateEl = document.getElementById('lunarTagDate');
  const navIconEl = document.getElementById('navMoonIcon');
  const shadowEl = document.getElementById('lunarShadow');
  const glowEl = document.getElementById('lunarGlow');

  if (phaseNameEl) phaseNameEl.textContent = moon.phaseName;
  if (illuminationEl) illuminationEl.textContent = `${moon.illumination}%`;
  if (ageEl) ageEl.textContent = `${moon.age} días`;
  if (zodiacEl) zodiacEl.textContent = moon.zodiac;
  if (distanceEl) distanceEl.textContent = `${moon.distanceKm.toLocaleString('es-ES')} km`;
  if (zodiacBadgeEl) zodiacBadgeEl.textContent = `♈ Luna en ${moon.zodiac}`;
  if (navIconEl) navIconEl.textContent = moon.phaseEmoji;

  const isToday = isSameDay(date, new Date());
  if (tagDateEl) {
    if (isToday) {
      tagDateEl.textContent = 'Hoy en tu cielo';
    } else {
      const options = { day: 'numeric', month: 'short', year: 'numeric' };
      tagDateEl.textContent = date.toLocaleDateString('es-ES', options);
    }
  }

  renderMoonPhaseShadow(shadowEl, glowEl, moon.fraction, moon.illumination);
}

function renderMoonPhaseShadow(shadowEl, glowEl, fraction, illumination) {
  if (!shadowEl) return;

  if (glowEl) {
    const opacity = Math.max(0.15, illumination / 100);
    glowEl.style.opacity = opacity.toString();
  }

  if (fraction < 0.03 || fraction > 0.97) {
    shadowEl.style.opacity = '0.96';
    shadowEl.style.clipPath = 'none';
  } else if (fraction >= 0.47 && fraction <= 0.53) {
    shadowEl.style.opacity = '0';
  } else {
    shadowEl.style.opacity = '0.9';
    if (fraction < 0.5) {
      const lightPct = (fraction * 2) * 100;
      shadowEl.style.clipPath = `polygon(0% 0%, ${100 - lightPct}% 0%, ${100 - lightPct}% 100%, 0% 100%)`;
    } else {
      const shadowPct = ((fraction - 0.5) * 2) * 100;
      shadowEl.style.clipPath = `polygon(${100 - shadowPct}% 0%, 100% 0%, 100% 100%, ${100 - shadowPct}% 100%)`;
    }
  }
}

function initDateControls() {
  const dateInput = document.getElementById('lunarDateInput');
  const btnToday = document.getElementById('btnToday');

  const todayIso = new Date().toISOString().split('T')[0];
  if (dateInput) {
    dateInput.value = todayIso;
    dateInput.addEventListener('change', (e) => {
      const selected = new Date(e.target.value + 'T12:00:00');
      if (!isNaN(selected)) {
        updateLunarView(selected);
      }
    });
  }

  if (btnToday) {
    btnToday.addEventListener('click', () => {
      if (dateInput) dateInput.value = todayIso;
      updateLunarView(new Date());
    });
  }
}

function initLunarDisplay() {
  updateLunarView(new Date());
}

function initDynamicStars() {
  const container = document.getElementById('starsContainer');
  if (!container) return;

  const count = 35;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'dynamic-star';
    star.style.position = 'absolute';
    star.style.top = `${Math.random() * 100}%`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.width = `${Math.random() * 2 + 1}px`;
    star.style.height = star.style.width;
    star.style.backgroundColor = '#ffffff';
    star.style.borderRadius = '50%';
    star.style.opacity = (Math.random() * 0.7 + 0.3).toString();
    fragment.appendChild(star);
  }

  container.appendChild(fragment);
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}
