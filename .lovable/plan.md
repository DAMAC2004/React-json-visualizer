## Cambios

1. Copiar `user-uploads://iconCAIM.png` a `public/favicon.png`.
2. Eliminar `public/favicon.ico` (el navegador lo pide por defecto y sobrescribiría el nuevo).
3. Editar `index.html`:
   - `<title>` → `CognitaAIMobile`
   - Agregar `<link rel="icon" href="/favicon.png" type="image/png">`
   - Actualizar `og:title` a `CognitaAIMobile` (ya estaba similar, lo unifico).