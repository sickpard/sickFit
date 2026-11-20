# SickFit — SCHEMA componente frontend

## Scopo e stato

Questo documento descrive il frontend che esiste nel monorepo. Il codice web è in `frontend/`; questa pagina sotto `docs/components/` è documentazione, non una directory sorgente. È una PWA/web app italiana, mobile-first e online-only, distinta dal client nativo in `mobile/`.

Stack e scripts dichiarati in `frontend/package.json`: Vue 3, TypeScript, Vite, Supabase JS e Vitest; package manager pnpm con lockfile `frontend/pnpm-lock.yaml`. I test e la build non sono stati eseguiti durante questo aggiornamento documentale.

## Bootstrap e composizione

1. `frontend/index.html` definisce pagina, metadata, viewport, manifest/icona e mount `#app`; carica `src/main.ts`.
2. `frontend/src/main.ts` importa gli stili globali, configura il tema iniziale e monta `App.vue`.
3. `frontend/src/App.vue` è la shell Vue e coordina gran parte delle schermate, dello stato e dei flussi applicativi; non risulta un router separato.
4. `frontend/src/style.css` definisce layout responsive e temi chiaro/scuro.
5. `frontend/vite.config.ts` imposta `envDir: '..'`: Vite legge la configurazione locale dalla root del monorepo. Non leggere né riportare valori di `.env.local`.

## Moduli principali

- `src/App.vue` — viste home, schede, sessione e storico; flussi di accesso, gestione dello stato e coordinamento delle query.
- `src/lib/supabase.ts` — inizializza Supabase JS usando `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`; non deve contenere chiavi privilegiate.
- `src/lib/auth.ts` — registrazione e login, compreso il login con username via Edge Function, recupero e aggiornamento password.
- `src/lib/workout.ts` — tipi e helper per schede/sessioni, bozze di serie, alternative, date e validazione/importazione JSON; i test unitari presenti sono sorgente, non prova di esecuzione in questa revisione.
- `src/lib/theme.ts` — sceglie il tema salvato o quello di sistema e memorizza la preferenza locale `sickfit-theme`; non persiste dati di allenamento.
- `src/lib/theme.test.ts`, `src/lib/workout.test.ts` — test del codice helper.
- `public/manifest.webmanifest` e asset PWA — manifest e icone. Non risulta un service worker né la configurazione del plugin `vite-plugin-pwa`; non documentare uso offline.
- `package.json`, `pnpm-lock.yaml`, `tsconfig*.json`, `vite.config.ts` — dipendenze e toolchain esclusivamente del frontend.

## Flussi e dati

### Autenticazione

Signup usa email/password e username in metadata. Il login username/email/password invoca `backend/supabase/functions/login-with-username`; la sessione restituita viene impostata tramite Supabase Auth. Il recupero password usa il reset email e la callback `PASSWORD_RECOVERY`. Questi sono flussi nel codice: configurazione dei redirect e corretto funzionamento con Supabase live vanno verificati separatamente.

### Schede e sessioni

- Le schede attive sono lette da `training_plans`, con versioni, giorni, esercizi e alternative ordinate secondo la logica applicativa.
- Creazione e modifica scrivono scheda e righe figlie; le modifiche del contenuto creano una nuova `plan_versions`, così le sessioni storiche restano associate alla versione originaria.
- L’import JSON viene validato e mostrato in anteprima prima del salvataggio; il limite file documentato è 1 MB. Import Notion non implementato.
- L’avvio crea una riga `workout_sessions`; il completamento registra `workout_exercises`, `exercise_sets` e `set_notes`, poi aggiorna la sessione. Sono richieste Supabase separate, non un’unica transazione atomica lato browser.
- Lo storico carica fino a 50 sessioni e risolve i nomi correlati con query ulteriori. L’isolamento e i vincoli devono essere garantiti da database/RLS, non dai soli controlli UI.

Per colonne, FK, regole dati e limiti di introspezione, usare il [contratto dati/API](../../data-and-api-schema.md).

## Confine backend e sicurezza

Il browser usa Supabase Auth e Supabase Data API direttamente con la publishable key e il token di sessione. Non esiste un’API applicativa Node/Express. Il solo codice server-side documentato è la Edge Function per il login con username, descritta nello [schema backend](../backend/SCHEMA.md); non inserire la service-role key nel client o nel bundle Vite.

La UI responsive mobile usa le stesse viste Vue del desktop. Per il client Expo nativo, ancora scaffold iniziale, vedere lo [schema mobile](../mobile/SCHEMA.md).

## Limiti

Il codice locale non dimostra deployment della Edge Function, correttezza delle policy RLS, configurazione Auth o funzionamento live. Nessun dato di allenamento è documentato come disponibile offline. La presente descrizione deriva da sorgenti e configurazioni, non è un test runtime.
