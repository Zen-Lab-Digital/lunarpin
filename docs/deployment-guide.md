# Guía de Despliegue — Lunar Pin

Instrucciones para publicar el sitio en GitHub Pages y vincularlo en Google Play Console.

## 1. Publicar en GitHub Pages

1. Sube el contenido de este repositorio (raíz: `index.html`, `privacy.html`, `css/`, `js/`, `assets/`) a un repositorio de GitHub llamado `lunarpin` bajo la organización `Zen-Lab-Digital`.
2. En el repositorio: **Settings → Pages**.
3. En **Build and deployment → Source**, selecciona **Deploy from a branch**.
4. Elige la rama `main` y la carpeta `/ (root)` — el sitio ya usa rutas relativas (`css/style.css`, `js/main.js`, `privacy.html`), verificado automáticamente por el contrato `PATH1` (`tests/landing.test.js`, `tests/privacy.test.js`), así que funciona sin cambios tanto en la URL de proyecto (`/lunarpin/`) como en un dominio propio.
5. Guarda. GitHub Pages publica en `https://zen-lab-digital.github.io/lunarpin/` en 1-2 minutos.
6. Verifica que carga con **HTTPS** (GitHub Pages lo fuerza automáticamente en `github.io`; no se requiere configuración adicional). Confirma abriendo la URL y comprobando el candado del navegador.

## 2. Dominio propio (opcional, solo si Zenlab Digital compra uno)

Este paso **no es necesario para publicar** — la URL por defecto de GitHub Pages ya es válida y estable para Google Play Console. Solo sigue esto si más adelante se adquiere un dominio propio (ej. `lunarpin.app`):

1. Crea un archivo `CNAME` en la raíz del repositorio con una sola línea: el dominio elegido (ej. `lunarpin.app`).
2. En el proveedor DNS del dominio, agrega un registro `CNAME` apuntando a `zen-lab-digital.github.io` (o los 4 registros `A` de GitHub Pages si el dominio es raíz/apex — ver la [documentación oficial de GitHub Pages](https://docs.github.com/pages) para las IPs vigentes).
3. En **Settings → Pages**, ingresa el dominio en **Custom domain** y espera la verificación DNS.
4. Activa **Enforce HTTPS** en la misma pantalla — GitHub emite el certificado TLS automáticamente tras la verificación (puede tardar hasta 24h).
5. Actualiza el `<link rel="canonical">` de `index.html` y `privacy.html`, y la URL de política de privacidad en Google Play Console (paso 3) al nuevo dominio.

## 3. Vincular en Google Play Console

1. En Google Play Console, entra a la ficha de la app (`com.zenlabdigital.lunarpin`).
2. Ve a **Política y programas → Contenido de la app → Política de privacidad**.
3. Pega la URL pública exacta: `https://zen-lab-digital.github.io/lunarpin/privacy.html` (o la equivalente con dominio propio si se configuró el paso 2).
4. Guarda y envía a revisión. Google Play requiere que esta URL esté accesible 24/7 sin autenticación — GitHub Pages cumple esto por diseño (hosting estático público).

## 4. Checklist pre-lanzamiento (auditoría de seguridad)

Verificado automáticamente por el contrato `SEC1` (`node --test tests/landing.test.js tests/privacy.test.js`), confirmado con ciclo rojo→verde real el 2026-09-10:

- ✅ Todos los recursos (`href`/`src`) usan HTTPS — cero enlaces `http://` inseguros.
- ✅ Todo enlace `target="_blank"` lleva `rel="noopener noreferrer"` (previene *reverse tabnabbing*).
- ✅ Cero SDKs de analítica/rastreo de terceros (Google Analytics, Meta, etc. — DT-02).
- ✅ Los 4 permisos del APK (`POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`, `FOREGROUND_SERVICE`, auditados en DT-03) están justificados en `privacy.html`.
- ✅ Rutas internas relativas, compatibles con el subpath `/lunarpin/` de GitHub Pages (`PATH1`).

## 5. Verificación post-despliegue

Tras publicar, confirma manualmente:

- [ ] `https://zen-lab-digital.github.io/lunarpin/` carga sin errores de consola.
- [ ] `https://zen-lab-digital.github.io/lunarpin/privacy.html` carga y el candado HTTPS está activo.
- [ ] El botón de Google Play y el de descarga de APK funcionan.
- [ ] La URL de privacidad pegada en Google Play Console responde HTTP 200.
