
# Plan: Conectar CognitaAI Mobile a la API real

Reemplazo total de `mockData.ts` por llamadas a `https://api-pruebas-mnts.onrender.com`. React Query para GETs; `useMutation` + `setInterval` con corrección de drift para el motor de examen. Calificación deferida (la API la entrega cuando vence el examen). Modal "Retomar examen" en el dashboard.

## 1. Configuración base

- Crear `.env` con `VITE_API_URL=https://api-pruebas-mnts.onrender.com`.
- Confirmar `.env*` en `.gitignore`.
- No se crea `netlify.toml` ni `_redirects` — Lovable hosting maneja el fallback SPA. Si luego se despliega a Netlify, se agregan ahí.

## 2. Capa de datos (`src/lib/`)

- **`api.ts`** — `apiFetch<T>(path, options)`:
  - Lee token de `localStorage` y arma `Authorization: Bearer`.
  - 401 → limpia token y redirige a `/`.
  - 204 → devuelve `null` (intentos/en_progreso).
  - Parsea `{status, detalle, codigo}` en errores. Clase `ApiError` con `status`+`codigo` para que la UI distinga `MAX_ATTEMPTS_REACHED`, `EXAM_EXPIRED`, `INVALID_STATE`.
- **`color.ts`** — `hexToHsl(#RRGGBB) → "H S% L%"`, `applyOrgBranding`, `resetOrgBranding`.
- **`auth.ts`** — `login`, `getMe`, `logout`.
- **`dashboard.ts`** — `getDashboard`.
- **`examenes.ts`** — `listExamenes`, `getExamenDetalle`, `iniciarExamen`, `getIntentoEnProgreso`, `autosaveIntento`, `entregarIntento`.
- **`capacitaciones.ts`** — `listCapacitaciones`, `getCapacitacionDetalle`.
- **`contenidos.ts`** — `listContenidos(capaci_id)`, `getContenidoUrl(conten_id)`.
- **`historial.ts`** — `listHistorial`, `getHistorialDetalle`.
- **`metricas.ts`** — `getMetricas`.
- **`certificados.ts`** — `listCertificados`.
- **`perfil.ts`** — `getPerfil`.

## 3. Tipos (`src/types/cognitaai.ts`)

Reescritura completa con el contrato exacto: UUIDs `string`, nombres `usuario_*`, `org_*`, `capaci_*`, `exam_*`, `inex_*`, `conten_*`. Tipos nuevos: `Usuario`, `Organizacion`, `LoginResponse`, `MeResponse`, `DashboardResponse`, `IntentoEnProgresoRef`, `ExamenListItem`, `ExamenDetalle`, `IntentoActivo`, `PreguntaAPI`/`OpcionAPI` (opciones como array `{letra, texto}`), `ProgresoExamen`, `AutosaveBody/Response`, `EntregarResponse`, `HistorialItem`, `HistorialDetalle`, `HistorialFeedback`, `MetricasResponse` + `EvolucionPunto`, `ContenidoItem/UrlResponse`, `CertificadoItem`.

## 4. AuthContext

- Estado: `{ isAuthenticated, usuario, organizacion, token, loading }`.
- `login(correo, password)` real → guarda token, setea usuario/org, aplica branding (hex→HSL).
- En el `useEffect` inicial: si hay token, `getMe()` para rehidratar; si falla, limpia y deja `loading=false`.
- `logout` limpia token, resetea branding, redirige.
- Solo persistir el token; usuario/org se reconstruyen al cargar.

## 5. Páginas

Loading/error consistentes con skeletons. Mensaje "El servidor se está iniciando, esto puede tardar unos segundos…" cuando la petición pase de 5 s (cold start de Render).

- **`Login.tsx`** — placeholders `alumno_f2_01@primaria-bj.edu.mx / Test1234`; manejo del cold start.
- **`Dashboard.tsx`** — `useQuery(['dashboard'])`. Renderiza `metricas`, `capacitaciones`, `examenes_pendientes`. Si `intento_en_progreso !== null`, abre `AlertDialog` "Tienes un examen en curso — Retomar / Cancelar" que navega a `/examen/{exam_id}?intento={intento_id}`.
- **`CapacitacionesPage.tsx`** — `useQuery(['capacitaciones'])`.
- **`ExamenesPage.tsx`** — `useQuery(['examenes'])`. Agrupar por `capaci_nombre`.
- **`ContenidosPage.tsx`** — toma capacitaciones del dashboard y dispara `useQueries` paralelas a `listContenidos(capaci_id)`. Botón "Ver" → `getContenidoUrl` → `window.open(url, '_blank')`.
- **`HistorialPage.tsx`** — `useQuery(['historial'])`. Badge "Resultados pendientes" si `resultados_disponibles=false`. Click → `/resultados?intento={id}`.
- **`MetricasPage.tsx`** — `useQuery(['metricas'])`. Gráfico de línea Recharts con `evolucion_promedio`.
- **`ExamEngine.tsx`** — flujo real:
  1. Al montar lee `?intento=` opcional. Si está presente y coincide, usa `getIntentoEnProgreso`; si no, llama `iniciarExamen(exam_id)`.
  2. Hidrata respuestas/marcadas desde `progreso_guardado` cuando `es_retoma=true`.
  3. **Timer robusto contra throttling de pestañas en segundo plano**: en lugar de decrementar contador local con `setInterval`, guarda `serverDeadline = Date.now() + tiempo_restante_seg*1000` y el timer renderiza `serverDeadline - Date.now()` calculado en cada tick (1 s). El tick puede saltar varios segundos si la pestaña estuvo dormida, pero la cuenta siempre refleja tiempo real.
  4. `setInterval` cada 30 s → `autosaveIntento` con `{respuestas, marcadas}`. Al volver la respuesta, **corrige `serverDeadline` con `Date.now() + tiempo_restante_seg*1000`** para eliminar drift.
  5. Renderiza opciones desde `pregunta.opciones[]` (no `opcion_a/b/c/d`).
  6. Entregar → `entregarIntento(intento_id, …)` → `navigate(`/resultados?intento=${intento_id}`, { replace: true })`. **Importante**: el `intento_id` siempre viaja por query param, no por `sessionStorage`.
  7. Maneja errores específicos (`MAX_ATTEMPTS_REACHED`, `EXAM_EXPIRED`, `INVALID_STATE`) con `toast` y redirige al dashboard.
- **`Results.tsx`** — lee `?intento=` del query. Llama `getHistorialDetalle(intento_id)`:
  - `resultados_disponibles=true` → muestra `calificacion`, `aciertos/total_preguntas`, badge aprobado/no aprobado, lista de `feedback[]` con respuesta del alumno vs correcta + explicación por opción.
  - `false` → tarjeta "Examen entregado. Los resultados estarán disponibles el {resultados_disponibles_en}".
  - Si no hay `intento` en query → redirige al historial.

## 6. Limpieza

- Eliminar `src/services/mockData.ts`.
- Quitar imports residuales de `calculateResults`, `mockDashboardResponse`, `mockLoginResponse`, `mockPreguntas`.
- Actualizar `mem://features/exam-engine` con: UUIDs, opciones como array, calificación deferida, timer basado en `serverDeadline + Date.now()`, sincronización con respuesta del autosave.

## Archivos afectados

```
crear:    .env, src/lib/{api,color,auth,dashboard,examenes,capacitaciones,
          contenidos,historial,metricas,certificados,perfil}.ts
editar:   src/types/cognitaai.ts, src/contexts/AuthContext.tsx,
          src/pages/{Login,Dashboard,Capacitaciones,Examenes,Contenidos,
          Historial,Metricas,ExamEngine,Results}.tsx, .gitignore
eliminar: src/services/mockData.ts
```
