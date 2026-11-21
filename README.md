# SickFit

Monorepo SickFit: PWA web Vue 3 + TypeScript + Vite, Supabase Edge Function TypeScript/Deno e client nativo Expo/React Native. Nel working tree è presente una prima implementazione locale dei tre componenti; non è stata compilata, testata o collegata a un endpoint remoto.

## Stato

**Stato da ricontrollare attentamente:** web e mobile hanno UI per Auth, schede/versioni, sessioni e storico; i client usano il contratto locale `domain`. L’utente ha installato le dipendenze web, avviato Vite e confermato il flusso signup/email. Lo script SQL è stato eseguito dall’utente; l’Edge Function resta sorgente locale non distribuita. In questa revisione non sono stati eseguiti test, typecheck o build; il runtime mobile non è verificato. Vedi [TODO](./docs/todo.md) per i controlli aperti.

## Backlog e verifica locale

- **Modifica/versionamento schede:** la UI duplica giorni ed esercizi in una nuova `plan_versions`; le sessioni esistenti continuano a riferirsi ai vecchi ID. Il nome della scheda resta invariato per evitare di riscrivere le etichette storiche. Il comportamento non è ancora verificato contro il progetto Supabase live.
- **Recupero password:** UI di richiesta link, gestione evento `PASSWORD_RECOVERY` e aggiornamento password implementati. Il redirect va consentito nelle impostazioni Auth Supabase e il flusso live non è stato provato.
- **Import JSON:** selezione file fino a 1 MB, validazione/normalizzazione e anteprima modificabile nel form di creazione; il salvataggio avviene solo dopo conferma. Formato: `{ name, days: [{ name, exercises: [{ name, min, max, optional?, notes?, alternatives? }] }] }`.
- **Import Notion:** non implementato; richiede un’integrazione server-side per non esporre il token e non è stato aggiunto alcun endpoint o segreto.
- **Workout di oggi:** la home mostra una scorciatoia quando il nome di un giorno della scheda contiene il giorno della settimana corrente in italiano; in assenza di una corrispondenza si continua dalla selezione manuale.

Verifiche locali documentate prima della riorganizzazione, su SickPC: `pnpm test` — 5 test superati; `pnpm build` — completata. `npm install` non è riuscito per un errore interno di npm (`Cannot read properties of null (reading 'edgesOut')`); `pnpm install` è riuscito e ha creato `pnpm-lock.yaml`. Queste verifiche non sono state ripetute dopo lo spostamento in `frontend/`. Nessun deploy o test d’integrazione Supabase eseguito. L’integrazione account/RLS richiede account di test distinti e resta da verificare.

Il login web/mobile a tre campi usa Auth Supabase diretto e verifica il profilo autenticato sotto RLS; l’accesso al profilo va provato contro le policy effettive. `login-with-username` resta sorgente locale legacy e non è necessario per il nuovo flusso.


## Struttura del monorepo

- `frontend/` — PWA Vue; dipendenze e `pnpm-lock.yaml` restano locali a questa app.
- `backend/supabase/` — configurazione e sorgenti locali delle Edge Functions `login-with-username` e `domain`; nessuna è attestata come distribuita.
- `mobile/` — client Expo/React Native con sorgenti per le schermate principali; dipendenze non installate, lockfile mobile assente, build/runtime non verificati.
- `docs/` — decisioni architetturali.
- `docs/todo.md` — attività aperte e stato dei prossimi passi.
- `wiki/` — documentazione funzionale e tecnica.
- `SCHEMA.md` — regole editoriali della wiki; il modello dati/API canonico è `docs/data-and-api-schema.md`.

Il file `.env.local`, se usato, resta nella root del monorepo; Vite carica la configurazione dalla root tramite `frontend/vite.config.ts`. Non copiare valori segreti in `.env.example` o nella documentazione.

## Ambiente di sviluppo

In un ambiente di sviluppo autorizzato, dalla directory `frontend/`:

1. Copia `../.env.example` nella root del monorepo come `.env.local` e inserisci `VITE_SUPABASE_URL` e la chiave *publishable* del progetto SickFit.
2. Installa le dipendenze con `pnpm install` (genera e aggiorna `pnpm-lock.yaml`).
3. Avvia Vite con `pnpm dev`.
4. Esegui i test con `pnpm test` e la build con `pnpm build` quando autorizzato per quell’ambiente.

Non inserire mai nel frontend una chiave `sb_secret` o `service_role`. I file `.env*` sono ignorati da Git, tranne `.env.example`.

## Supabase

Il 21 novembre 2026 l’utente ha eseguito `docs/sickfit-domain.sql` nel progetto Supabase SickFit. Una successiva lettura del catalogo ha confermato le cinque funzioni RPC `SECURITY INVOKER`, RLS e policy owner-scoped sulle nove tabelle di dominio e i privilegi tabellari effettivi richiesti. Il comportamento delle RPC non è stato invocato/testato e l’Edge Function `domain` resta sorgente locale non distribuita; vedere [`docs/todo.md`](./docs/todo.md) per i controlli residui.

`login-with-username` è ancora configurata con `verify_jwt = false` ed è legacy; la revisione locale segnala che mancano protezioni contro tentativi ripetuti. `domain` è configurata con `verify_jwt = true`. Entrambe restano non distribuite/non provate. Prima di qualsiasi deploy verificare CORS (`SICKFIT_ALLOWED_ORIGINS`), rate limiting/quote, RLS/grants e flussi Auth.

## PWA

Manifest e icone sono presenti. Non c’è service worker e non viene memorizzato contenuto per l’uso offline. L’installazione come PWA dipenderà anche dall’hosting HTTPS e dal browser.

## Git

La PWA Vue è stata spostata in `frontend/` nella repository esistente. La cronologia Git precedente resta nella stessa repository; `origin` punta a `git@github.com:sickpard/sickFit.git`.

## Documentazione

- [AGENTS.md](./AGENTS.md) contiene le istruzioni operative vincolanti per questa repository.
- [SCHEMA.md](./SCHEMA.md) definisce lo schema editoriale della wiki; il [contratto dati/API](./docs/data-and-api-schema.md) distingue fatti verificati e lacune.
- [TODO del progetto](./docs/todo.md) registra attività completate e ancora aperte.
- [Contratto API locale v1](./docs/api-contract.md) e [SQL RPC](./docs/sickfit-domain.sql) (eseguito nel progetto SickFit il 21 novembre 2026; readback catalogo, senza test runtime).
- La [wiki SickFit](./wiki/index.md) raccoglie panoramica, pagine prodotto e confini dei componenti.
- Schemi tecnici: [frontend](./docs/components/frontend/SCHEMA.md), [backend](./docs/components/backend/SCHEMA.md), [mobile](./docs/components/mobile/SCHEMA.md).
- [Schema editoriale del manuale utente](./wiki/user-manual-schema.md).
