import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const PRIVACY_PATH = path.resolve(process.cwd(), 'privacy.html');

test('PRIV1 - estructura legal, metadatos y cláusula de cero PII', async (t) => {
  await t.test('el archivo privacy.html debe existir en la raíz del proyecto', () => {
    assert.ok(fs.existsSync(PRIVACY_PATH), 'privacy.html debe existir físicamente en la raíz');
  });

  const content = fs.existsSync(PRIVACY_PATH) ? fs.readFileSync(PRIVACY_PATH, 'utf8') : '';

  await t.test('debe contener DOCTYPE html y estructura semántica en español', () => {
    assert.match(content, /<!DOCTYPE html>/i, 'Debe declarar <!DOCTYPE html>');
    assert.match(content, /<html[^>]*lang=["']es["']/i, 'El atributo lang debe ser español (es)');
    assert.match(content, /<title>.*(?:Privacidad|Privacy).*Lunar\s*Pin.*<\/title>/i, 'El título debe hacer referencia a privacidad y Lunar Pin');
  });

  await t.test('debe contener identificación del paquete com.zenlabdigital.lunarpin', () => {
    assert.match(content, /com\.zenlabdigital\.lunarpin/, 'Debe mencionar explícitamente el paquete com.zenlabdigital.lunarpin');
  });

  await t.test('debe identificar a Zenlab Digital como desarrollador responsable', () => {
    assert.match(content, /Zenlab\s+Digital/i, 'Debe identificar a Zenlab Digital como entidad responsable');
  });

  await t.test('debe contener enlace de retorno a index.html', () => {
    assert.match(content, /<a[^>]+href=["'](?:\.\/)?index\.html["'][^>]*>.*(?:Inicio|Volver|Regresar|Lunar Pin)/is, 'Debe incluir enlace de retorno a index.html');
  });

  await t.test('debe contener cláusula explícita de no recolección de PII ni rastreo de terceros', () => {
    // Zero PII / no personal data collection clause
    assert.match(content, /(?:cero|no)\s+(?:recopilaci[oó]n|recolecta|recopila).*(?:datos|informaci[oó]n)\s+personales?|zero\s*pii|personally\s+identifiable/i, 'Debe declarar que no recopila información personal');
    assert.match(content, /(?:offline|local|sin\s+servidores|sin\s+cuenta)/i, 'Debe explicitar la arquitectura local u offline');
  });

  await t.test('debe incluir correo de contacto para soporte o consultas de privacidad', () => {
    assert.match(content, /zenlabdigital@gmail\.com/i, 'Debe proveer correo oficial de contacto zenlabdigital@gmail.com');
  });
});

test('PRIV2 - desglose y justificación técnica de permisos del APK', async (t) => {
  const content = fs.existsSync(PRIVACY_PATH) ? fs.readFileSync(PRIVACY_PATH, 'utf8') : '';

  await t.test('debe justificar el permiso POST_NOTIFICATIONS', () => {
    assert.match(content, /POST_NOTIFICATIONS/, 'Debe mencionar explícitamente POST_NOTIFICATIONS');
    assert.match(content, /POST_NOTIFICATIONS[\s\S]*?(?:notificaci[oó]n|alerta|aviso|fases?|eventos?)/i, 'Debe justificar el uso de POST_NOTIFICATIONS para alertas locales');
  });

  await t.test('debe justificar el permiso RECEIVE_BOOT_COMPLETED', () => {
    assert.match(content, /RECEIVE_BOOT_COMPLETED/, 'Debe mencionar explícitamente RECEIVE_BOOT_COMPLETED');
    assert.match(content, /RECEIVE_BOOT_COMPLETED[\s\S]*?(?:reinicio|encender|arranc(?:ar|e)|reprogram)/i, 'Debe justificar el uso de RECEIVE_BOOT_COMPLETED para reprogramar alarmas locales');
  });

  await t.test('debe justificar el permiso WAKE_LOCK', () => {
    assert.match(content, /WAKE_LOCK/, 'Debe mencionar explícitamente WAKE_LOCK');
    assert.match(content, /WAKE_LOCK[\s\S]*?(?:reloj|segundo\s+plano|precisi[oó]n|astron[oó]mico|actualiz)/i, 'Debe justificar el uso de WAKE_LOCK para actualización precisa del reloj astronómico');
  });

  await t.test('debe justificar el permiso FOREGROUND_SERVICE', () => {
    assert.match(content, /FOREGROUND_SERVICE/, 'Debe mencionar explícitamente FOREGROUND_SERVICE');
    assert.match(content, /FOREGROUND_SERVICE[\s\S]*?(?:widget|glance|pantalla\s+de\s+inicio)/i, 'Debe justificar el uso de FOREGROUND_SERVICE para el widget de pantalla de inicio');
  });
});

test('SEC1 - auditoría de seguridad y privacidad pre-lanzamiento (privacy.html)', async (t) => {
  const content = fs.existsSync(PRIVACY_PATH) ? fs.readFileSync(PRIVACY_PATH, 'utf8') : '';

  await t.test('todos los recursos referenciados deben ser HTTPS (sin http:// inseguro)', () => {
    const insecure = content.match(/(?:href|src)=["']http:\/\/[^"']+["']/gi) || [];
    assert.deepStrictEqual(insecure, [], `No debe haber recursos http:// inseguros: ${insecure.join(', ')}`);
  });

  await t.test('cualquier enlace target="_blank" debe llevar rel="noopener"', () => {
    const blankLinks = content.match(/<a[^>]+target=["']_blank["'][^>]*>/gi) || [];
    for (const link of blankLinks) {
      assert.match(link, /rel=["'][^"']*noopener[^"']*["']/i, `Enlace target="_blank" sin rel="noopener": ${link}`);
    }
  });

  await t.test('no debe incluir SDKs ni scripts de rastreo/analítica de terceros', () => {
    assert.doesNotMatch(content, /gtag|google-analytics|googletagmanager|facebook\.net|connect\.facebook|doubleclick|hotjar|mixpanel|segment\.io|clarity\.ms/i, 'No debe referenciar scripts de analítica/tracking de terceros (DT-02: cero telemetría)');
  });

  await t.test('los 4 permisos del APK auditados (DT-03) deben coincidir exactamente con los declarados aquí', () => {
    const auditedPermissions = ['POST_NOTIFICATIONS', 'RECEIVE_BOOT_COMPLETED', 'WAKE_LOCK', 'FOREGROUND_SERVICE'];
    for (const perm of auditedPermissions) {
      assert.match(content, new RegExp(perm), `Permiso auditado en DT-03 ausente en privacy.html: ${perm}`);
    }
  });
});

test('PATH1 - rutas relativas compatibles con subpath de GitHub Pages (privacy.html)', async (t) => {
  const content = fs.existsSync(PRIVACY_PATH) ? fs.readFileSync(PRIVACY_PATH, 'utf8') : '';

  await t.test('ningún href/src interno debe ser una ruta absoluta desde raíz (rompería bajo /lunarpin/)', () => {
    const rootAbsolute = content.match(/(?:href|src)=["']\/(?!\/)[^"']*["']/gi) || [];
    assert.deepStrictEqual(rootAbsolute, [], `No debe haber rutas absolutas desde raíz: ${rootAbsolute.join(', ')}`);
  });
});
