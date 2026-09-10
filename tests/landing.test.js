import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const INDEX_PATH = path.resolve(process.cwd(), 'index.html');

test('LAND1 - contratos estructurales y metadatos de index.html', async (t) => {
  await t.test('el archivo index.html debe existir en la raíz del proyecto', () => {
    assert.ok(fs.existsSync(INDEX_PATH), 'index.html debe existir físicamente en la raíz');
  });

  const content = fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, 'utf8') : '';

  await t.test('debe contener DOCTYPE html y estructura semántica básica', () => {
    assert.match(content, /<!DOCTYPE html>/i, 'Debe declarar <!DOCTYPE html>');
    assert.match(content, /<html[^>]*lang=["']es["']/i, 'El atributo lang debe ser español (es)');
    assert.match(content, /<title>.*Lunar\s*Pin.*<\/title>/i, 'El título debe incluir Lunar Pin');
  });

  await t.test('debe contener meta viewport para diseño responsivo', () => {
    assert.match(content, /<meta[^>]+name=["']viewport["'][^>]+content=["'][^"']*width=device-width[^"']*["']/i, 'Debe incluir meta viewport con width=device-width');
  });

  await t.test('debe contener meta tags de Open Graph (og:title, og:description, og:image, og:type)', () => {
    assert.match(content, /<meta[^>]+property=["']og:title["']/i, 'Debe incluir og:title');
    assert.match(content, /<meta[^>]+property=["']og:description["']/i, 'Debe incluir og:description');
    assert.match(content, /<meta[^>]+property=["']og:image["']/i, 'Debe incluir og:image');
    assert.match(content, /<meta[^>]+property=["']og:type["']/i, 'Debe incluir og:type');
  });

  await t.test('debe enlazar css/style.css y js/main.js', () => {
    assert.match(content, /<link[^>]+href=["'][^"']*css\/style\.css["']/i, 'Debe enlazar css/style.css');
    assert.match(content, /<script[^>]+src=["'][^"']*js\/main\.js["']/i, 'Debe enlazar js/main.js');
  });

  await t.test('debe contener enlace de navegación a la Política de Privacidad (privacy.html)', () => {
    assert.match(content, /<a[^>]+href=["'][^"']*privacy\.html["']/i, 'Debe tener al menos un enlace a privacy.html');
  });

  await t.test('debe incluir botones o llamadas a la acción (CTA) de descarga para Google Play y APK', () => {
    assert.match(content, /href=["'][^"']*(?:play\.google\.com|download|apk|#download)[^"']*["']/i, 'Debe incluir enlace CTA de descarga');
    assert.match(content, /(?:Google\s*Play|Descargar|APK|Instalar)/i, 'Debe mostrar texto descriptivo de descarga');
  });

  await t.test('debe referenciar capturas de pantalla de la app móvil en sección showcase', () => {
    assert.match(content, /(?:Screenshot_20260908_\d+_LunarPin\.jpg|app-preview|captura)/i, 'Debe referenciar imágenes de preview o capturas de Lunar Pin');
  });
});

test('VIS1 - experiencia visual de showcase, widgets y accesibilidad', async (t) => {
  const content = fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, 'utf8') : '';

  await t.test('debe incluir sección de showcase con capturas y marco de dispositivo', () => {
    assert.match(content, /id=["']showcase["']/i, 'Debe existir la sección #showcase');
    assert.match(content, /class=["'][^"']*phone-frame[^"']*["']/i, 'Debe contener marcos de teléfono para las capturas');
    assert.match(content, /class=["'][^"']*app-screenshot[^"']*["']/i, 'Debe contener imágenes con clase app-screenshot');
  });

  await t.test('todas las imágenes deben tener atributos alt descriptivos (WCAG AA)', () => {
    const imgMatches = content.match(/<img[^>]+>/g) || [];
    assert.ok(imgMatches.length > 0, 'Debe haber al menos una imagen en la página');
    for (const img of imgMatches) {
      assert.match(img, /alt=["'][^"']+["']/i, `La imagen debe tener atributo alt no vacío: ${img}`);
    }
  });

  await t.test('debe contener la tarjeta interactiva de la luna con controles de fecha', () => {
    assert.match(content, /id=["']lunarWidgetCard["']/i, 'Debe contener #lunarWidgetCard');
    assert.match(content, /id=["']lunarPhaseName["']/i, 'Debe contener #lunarPhaseName');
    assert.match(content, /id=["']lunarIllumination["']/i, 'Debe contener #lunarIllumination');
    assert.match(content, /id=["']lunarDateInput["']/i, 'Debe contener #lunarDateInput');
  });

  await t.test('DIST1 - debe contener el elemento de distancia Tierra-Luna en el widget', () => {
    assert.match(content, /id=["']lunarDistance["']/i, 'Debe contener #lunarDistance');
  });

  await t.test('debe incluir sección de características con los 3 pilares', () => {
    assert.match(content, /id=["']features["']/i, 'Debe existir la sección #features');
    assert.match(content, /(?:Cálculo|Precisión)\s*(?:Matemático|Astronómica)/i, 'Debe detallar precisión astronómica');
    assert.match(content, /(?:Privada|Privacidad|Offline)/i, 'Debe detallar privacidad y offline');
    assert.match(content, /(?:Rendimiento|Batería|Glance)/i, 'Debe detallar rendimiento y widgets');
  });
});

test('SEC1 - auditoría de seguridad y privacidad pre-lanzamiento (index.html)', async (t) => {
  const content = fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, 'utf8') : '';

  await t.test('todos los recursos referenciados deben ser HTTPS (sin http:// inseguro)', () => {
    const insecure = content.match(/(?:href|src)=["']http:\/\/[^"']+["']/gi) || [];
    assert.deepStrictEqual(insecure, [], `No debe haber recursos http:// inseguros: ${insecure.join(', ')}`);
  });

  await t.test('todo enlace target="_blank" debe llevar rel="noopener" (previene reverse tabnabbing)', () => {
    const blankLinks = content.match(/<a[^>]+target=["']_blank["'][^>]*>/gi) || [];
    assert.ok(blankLinks.length > 0, 'Debe existir al menos un enlace externo target="_blank" que auditar');
    for (const link of blankLinks) {
      assert.match(link, /rel=["'][^"']*noopener[^"']*["']/i, `Enlace target="_blank" sin rel="noopener": ${link}`);
    }
  });

  await t.test('no debe incluir SDKs ni scripts de rastreo/analítica de terceros', () => {
    assert.doesNotMatch(content, /gtag|google-analytics|googletagmanager|facebook\.net|connect\.facebook|doubleclick|hotjar|mixpanel|segment\.io|clarity\.ms/i, 'No debe referenciar scripts de analítica/tracking de terceros (DT-02: cero telemetría)');
  });
});

test('PATH1 - rutas relativas compatibles con subpath de GitHub Pages (index.html)', async (t) => {
  const content = fs.existsSync(INDEX_PATH) ? fs.readFileSync(INDEX_PATH, 'utf8') : '';

  await t.test('ningún href/src interno debe ser una ruta absoluta desde raíz (rompería bajo /lunarpin/)', () => {
    const rootAbsolute = content.match(/(?:href|src)=["']\/(?!\/)[^"']*["']/gi) || [];
    assert.deepStrictEqual(rootAbsolute, [], `No debe haber rutas absolutas desde raíz: ${rootAbsolute.join(', ')}`);
  });
});

