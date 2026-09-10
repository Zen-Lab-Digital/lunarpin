/**
 * Motor de cálculo astronómico lunar para Lunar Pin.
 * Basado en el ciclo sinódico medio (~29.530588 días) y coordenadas eclípticas.
 * Libre de dependencias externas.
 */

// Constantes astronómicas
const SYNODIC_MONTH = 29.53058770576; // Días en un mes sinódico
const SIDEREAL_MONTH = 27.321661;     // Días en un mes sideral
const ANOMALISTIC_MONTH = 27.554549878; // Días en un mes anomalístico (perigeo a perigeo)
// Época de referencia conocida: Luna Nueva del 6 de enero de 2000 a las 18:14 UTC
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);
// Perigeo de referencia conocido, cercano a la época anterior (4 de enero de 2000)
const KNOWN_PERIGEE = Date.UTC(2000, 0, 4, 21, 0, 0);
const MEAN_DISTANCE_KM = 384400; // Semi-eje mayor de la órbita lunar
const ORBIT_ECCENTRICITY = 0.0549;

const ZODIAC_SIGNS = [
  'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
  'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
];

/**
 * Calcula la fase lunar, edad, iluminación y signo zodiacal para una fecha dada.
 * @param {Date} [targetDate=new Date()] Fecha para calcular.
 * @returns {Object} Datos lunares detallados.
 */
export function getMoonPhase(targetDate = new Date()) {
  const date = (targetDate instanceof Date && !isNaN(targetDate)) ? targetDate : new Date();
  const timeMs = date.getTime();

  // Días transcurridos desde la época de referencia
  const diffDays = (timeMs - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);

  // Ciclos sinódicos completados y fracción actual
  let cycles = diffDays / SYNODIC_MONTH;
  let fraction = cycles - Math.floor(cycles);
  if (fraction < 0) fraction += 1;

  // Edad lunar en días [0 - 29.53]
  const age = Math.round(fraction * SYNODIC_MONTH * 100) / 100;

  // Porcentaje de iluminación geométrica [0% - 100%]
  // Ángulo de fase: 0 en luna nueva, PI en luna llena, 2PI en siguiente nueva
  const phaseAngle = fraction * 2 * Math.PI;
  const illumination = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100);

  // Clasificación de fase y emoji
  let phaseName = '';
  let phaseEmoji = '';
  let phaseDescription = '';

  if (fraction < 0.03 || fraction > 0.97) {
    phaseName = 'Luna Nueva';
    phaseEmoji = '🌑';
    phaseDescription = 'El disco lunar se encuentra alineado entre la Tierra y el Sol, no visible.';
  } else if (fraction < 0.22) {
    phaseName = 'Creciente Iluminante';
    phaseEmoji = '🌒';
    phaseDescription = 'Delgada curva de luz visible al atardecer sobre el horizonte oeste.';
  } else if (fraction < 0.28) {
    phaseName = 'Cuarto Creciente';
    phaseEmoji = '🌓';
    phaseDescription = 'La mitad derecha de la Luna aparece iluminada con claridad.';
  } else if (fraction < 0.47) {
    phaseName = 'Gibosa Creciente';
    phaseEmoji = '🌔';
    phaseDescription = 'Más de la mitad de la superficie lunar resplandece en el cielo.';
  } else if (fraction < 0.53) {
    phaseName = 'Luna Llena';
    phaseEmoji = '🌕';
    phaseDescription = 'Plenitud total de iluminación, visible durante toda la noche.';
  } else if (fraction < 0.72) {
    phaseName = 'Gibosa Menguante';
    phaseEmoji = '🌖';
    phaseDescription = 'Comienza a menguar la superficie iluminada tras el plenilunio.';
  } else if (fraction < 0.78) {
    phaseName = 'Cuarto Menguante';
    phaseEmoji = '🌗';
    phaseDescription = 'La mitad izquierda iluminada, visible en horas de la madrugada.';
  } else {
    phaseName = 'Luna Menguante';
    phaseEmoji = '🌘';
    phaseDescription = 'Fina curva visible antes del amanecer en el horizonte este.';
  }

  // Signo zodiacal lunar aproximado (basado en longitud eclíptica)
  // Días desde J2000.0 (1 de enero 2000, 12:00 UTC)
  const j2000Days = (timeMs - Date.UTC(2000, 0, 1, 12, 0, 0)) / (1000 * 60 * 60 * 24);
  // Longitud media del sol
  const sunLong = (280.460 + 0.9856474 * j2000Days) % 360;
  // Longitud aproximada de la luna
  let moonLong = (sunLong + fraction * 360) % 360;
  if (moonLong < 0) moonLong += 360;

  const signIndex = Math.floor(moonLong / 30) % 12;
  const zodiac = ZODIAC_SIGNS[signIndex];

  // Distancia orbital Tierra-Luna: aproximación elíptica sobre el mes anomalístico
  const daysSincePerigee = (timeMs - KNOWN_PERIGEE) / (1000 * 60 * 60 * 24);
  let anomalyCycles = daysSincePerigee / ANOMALISTIC_MONTH;
  let meanAnomaly = (anomalyCycles - Math.floor(anomalyCycles)) * 2 * Math.PI;
  const distanceKm = Math.round(MEAN_DISTANCE_KM * (1 - ORBIT_ECCENTRICITY * Math.cos(meanAnomaly)));

  return {
    date: date.toISOString().split('T')[0],
    phaseName,
    phaseEmoji,
    phaseDescription,
    age,
    illumination,
    fraction: Math.round(fraction * 1000) / 1000,
    zodiac,
    distanceKm
  };
}

/**
 * Retorna las fases lunares para los días de un mes dado.
 * @param {number} year Año gregoriano.
 * @param {number} month Mes (0 a 11).
 * @returns {Array<Object>} Lista de estados lunares por día.
 */
export function getMoonPhasesForMonth(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day, 12, 0, 0);
    result.push({
      day,
      ...getMoonPhase(d)
    });
  }
  return result;
}
