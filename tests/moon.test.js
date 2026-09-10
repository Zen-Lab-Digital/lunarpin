import test from 'node:test';
import assert from 'node:assert/strict';
import { getMoonPhase, getMoonPhasesForMonth } from '../js/moon-calculator.js';

test('MOON1 - cálculo de fase lunar, edad y porcentaje de iluminación', async (t) => {
  await t.test('debe exportar la función getMoonPhase', () => {
    assert.strictEqual(typeof getMoonPhase, 'function');
  });

  await t.test('debe retornar estructura válida con propiedades requeridas para fecha actual', () => {
    const moon = getMoonPhase();
    assert.ok(moon, 'El resultado debe ser un objeto');
    assert.strictEqual(typeof moon.phaseName, 'string', 'phaseName debe ser string');
    assert.strictEqual(typeof moon.age, 'number', 'age debe ser number');
    assert.ok(moon.age >= 0 && moon.age <= 29.53, 'age debe estar en rango [0, 29.53]');
    assert.strictEqual(typeof moon.illumination, 'number', 'illumination debe ser number');
    assert.ok(moon.illumination >= 0 && moon.illumination <= 100, 'illumination debe estar en rango [0, 100]');
    assert.strictEqual(typeof moon.zodiac, 'string', 'zodiac debe ser string con el signo zodiacal');
    assert.strictEqual(typeof moon.phaseEmoji, 'string', 'phaseEmoji debe ser string');
  });

  await t.test('debe calcular correctamente Luna Nueva en fecha de referencia conocida (2000-01-06 18:14 UTC)', () => {
    const date = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const moon = getMoonPhase(date);
    assert.ok(moon.age < 1.5 || moon.age > 28.0, `La edad lunar debe ser cercana a 0, obtenida: ${moon.age}`);
    assert.ok(moon.illumination <= 5, `La iluminación debe ser cercana a 0%, obtenida: ${moon.illumination}%`);
    assert.match(moon.phaseName, /nueva/i, 'El nombre debe indicar Luna Nueva');
  });

  await t.test('debe calcular correctamente Luna Llena en fecha de referencia conocida (2024-01-25 17:54 UTC)', () => {
    const date = new Date(Date.UTC(2024, 0, 25, 17, 54, 0));
    const moon = getMoonPhase(date);
    assert.ok(moon.age >= 13.5 && moon.age <= 16.5, `La edad lunar en Luna Llena debe rondar 14.76 días, obtenida: ${moon.age}`);
    assert.ok(moon.illumination >= 95, `La iluminación debe superar 95%, obtenida: ${moon.illumination}%`);
    assert.match(moon.phaseName, /llena/i, 'El nombre debe indicar Luna Llena');
  });

  await t.test('debe calcular Cuarto Creciente en fecha de referencia conocida (2024-01-18)', () => {
    const date = new Date(Date.UTC(2024, 0, 18, 3, 52, 0));
    const moon = getMoonPhase(date);
    assert.ok(moon.age >= 6.0 && moon.age <= 9.0, `La edad lunar debe estar cerca de 7.38 días, obtenida: ${moon.age}`);
    assert.ok(moon.illumination >= 40 && moon.illumination <= 65, `La iluminación debe rondar el 50%, obtenida: ${moon.illumination}%`);
    assert.match(moon.phaseName, /creciente/i, 'El nombre debe indicar fase creciente');
  });

  await t.test('debe retornar signo zodiacal lunar válido en español', () => {
    const validSigns = [
      'Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
      'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'
    ];
    const moon = getMoonPhase(new Date());
    assert.ok(validSigns.includes(moon.zodiac), `Signo ${moon.zodiac} debe pertenecer al zodíaco`);
  });
});

test('DIST1 - cálculo de distancia orbital Tierra-Luna', async (t) => {
  await t.test('debe incluir distanceKm numérico en rango orbital real (356500 km - 406700 km aprox.)', () => {
    const moon = getMoonPhase(new Date());
    assert.strictEqual(typeof moon.distanceKm, 'number', 'distanceKm debe ser number');
    assert.ok(moon.distanceKm >= 355000 && moon.distanceKm <= 407000, `distanceKm debe estar en rango orbital real, obtenido: ${moon.distanceKm}`);
  });

  await t.test('la distancia debe variar de forma cíclica entre fechas distintas (no debe ser constante)', () => {
    const d1 = getMoonPhase(new Date(Date.UTC(2024, 0, 1))).distanceKm;
    const d2 = getMoonPhase(new Date(Date.UTC(2024, 0, 15))).distanceKm;
    const d3 = getMoonPhase(new Date(Date.UTC(2024, 1, 1))).distanceKm;
    assert.ok(!(d1 === d2 && d2 === d3), 'La distancia debe cambiar entre fechas distintas dentro del ciclo anomalístico');
  });

  await t.test('debe acercarse al perigeo (~363000 km) y al apogeo (~405000 km) en su ciclo anomalístico de 27.55 días', () => {
    const perigeeDate = new Date(Date.UTC(2000, 0, 4, 21, 0, 0));
    const apogeeDate = new Date(perigeeDate.getTime() + (27.554549878 / 2) * 24 * 60 * 60 * 1000);
    const perigee = getMoonPhase(perigeeDate).distanceKm;
    const apogee = getMoonPhase(apogeeDate).distanceKm;
    assert.ok(perigee <= 365000, `El perigeo debe rondar ~363000 km, obtenido: ${perigee}`);
    assert.ok(apogee >= 403000, `El apogeo debe rondar ~405000 km, obtenido: ${apogee}`);
  });
});
