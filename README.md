# SickFit

Monorepo SickFit per la PWA web, i servizi Supabase e uno scaffold mobile nativo. Il frontend Vue 3 + TypeScript + Vite usa Supabase Auth e Postgres con RLS. `backend/` contiene configurazione e una Edge Function per il login, non un’API di dominio condivisa; `mobile/` contiene solo una schermata Expo/React Native segnaposto.

## Stato

Prima iterazione locale: UI italiana per registrazione/accesso, creazione di schede con più giorni ed esercizi, scelta manuale del giorno, registrazione di esercizi/serie/note e vista dello storico. Tema chiaro/scuro selezionabile, con preferenza salvata sul dispositivo e scelta iniziale basata sul tema del sistema. L’app non usa dati demo e non conserva sessioni offline.

## Backlog e verifica locale

- **Modifica/versionamento schede:** la UI duplica giorni ed esercizi in una nuova `plan_versions`; le sessioni esistenti continuano a riferirsi ai vecchi ID. Il nome della scheda resta invariato per evitare di riscrivere le etichette storiche. Il comportamento non è ancora verificato contro il progetto Supabase live.
- **Recupero password:** UI di richiesta link, gestione evento `PASSWORD_RECOVERY` e aggiornamento password implementati. Il redirect va consentito nelle impostazioni Auth Supabase e il flusso live non è stato provato.
- **Import JSON:** selezione file fino a 1 MB, validazione/normalizzazione e anteprima modificabile nel form di creazione; il salvataggio avviene solo dopo conferma. Formato: `{ name, days: [{ name, exercises: [{ name, min, max, optional?, notes?, alternatives? }] }] }`.
- **Import Notion:** non implementato; richiede un’integrazione server-side per non esporre il token e non è stato aggiunto alcun endpoint o segreto.
- **Workout di oggi:** la home mostra una scorciatoia quando il nome di un giorno della scheda contiene il giorno della settimana corrente in italiano; in assenza di una corrispondenza si continua dalla selezione manuale.

Verifiche locali documentate prima della riorganizzazione, su SickPC: `pnpm test` — 5 test superati; `pnpm build` — completata. `npm install` non è riuscito per un errore interno di npm (`Cannot read properties of null (reading 'edgesOut')`); `pnpm install` è riuscito e ha creato `pnpm-lock.yaml`. Queste verifiche non sono state ripetute dopo lo spostamento in `frontend/`. Nessun deploy o test d’integrazione Supabase eseguito. L’integrazione account/RLS richiede account di test distinti e resta da verificare.

Il login a tre campi richiede anche la Edge Function sotto `backend/supabase/functions/login-with-username`, che è solo sorgente locale e non è stata deployata.


## Struttura del monorepo

- `frontend/` — PWA Vue esistente; dipendenze e `pnpm-lock.yaml` del frontend restano locali a questa app.
- `backend/supabase/` — configurazione Supabase e sorgente locale della Edge Function esistente; non equivale a un’API di dominio già implementata.
- `mobile/` — scaffold Expo/React Native TypeScript con schermata iniziale segnaposto; autenticazione, navigazione e schermate funzionali restano da implementare.
- `docs/` — decisioni architetturali.
- `docs/todo.md` — attività aperte e stato dei prossimi passi.
- `wiki/` — documentazione funzionale e tecnica.
- `SCHEMA.md` — riferimento canonico del modello dati e dei contratti Supabase osservati.

Il file `.env.local`, se usato, resta nella root del monorepo; Vite carica la configurazione dalla root tramite `frontend/vite.config.ts`. Non copiare valori segreti in `.env.example` o nella documentazione.

## Ambiente di sviluppo

In un ambiente di sviluppo autorizzato, dalla directory `frontend/`:

1. Copia `../.env.example` nella root del monorepo come `.env.local` e inserisci `VITE_SUPABASE_URL` e la chiave *publishable* del progetto SickFit.
2. Installa le dipendenze con `pnpm install` (genera e aggiorna `pnpm-lock.yaml`).
3. Avvia Vite con `pnpm dev`.
4. Esegui i test con `pnpm test` e la build con `pnpm build` quando autorizzato per quell’ambiente.

Non inserire mai nel frontend una chiave `sb_secret` o `service_role`. I file `.env*` sono ignorati da Git, tranne `.env.example`.

## Supabase

Le tabelle e le policy RLS sono state create nel progetto Supabase `sickfit`. Il file `backend/supabase/functions/login-with-username/index.ts` implementa il controllo della coppia username/email e poi delega la verifica della password a Supabase Auth. La funzione richiede le variabili server-side `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (oppure `SUPABASE_ANON_KEY`) e `SUPABASE_SERVICE_ROLE_KEY`; non committarle e non inserirle nel frontend.

La funzione è configurata con `verify_jwt = false` perché viene chiamata prima che l’utente abbia una sessione. La revisione locale rileva che manca un rate limiting applicativo; prima dell’esposizione pubblica servono una protezione contro tentativi ripetuti, la verifica della configurazione CORS (`SICKFIT_ALLOWED_ORIGINS`) e un test controllato. Non è stata distribuita né provata.

## PWA

Manifest e icone sono presenti. Non c’è service worker e non viene memorizzato contenuto per l’uso offline. L’installazione come PWA dipenderà anche dall’hosting HTTPS e dal browser.

## Git

La PWA Vue è stata spostata in `frontend/` nella repository esistente. La cronologia Git precedente resta nella stessa repository; `origin` punta a `git@github.com:sickpard/sickFit.git`.

## Documentazione

- [AGENTS.md](./AGENTS.md) contiene le istruzioni operative vincolanti per questa repository.
- [SCHEMA.md](./SCHEMA.md) documenta il modello dati e i contratti API osservati, distinguendo i dati verificati dalle lacune.
- [TODO del progetto](./docs/todo.md) registra attività completate e ancora aperte.
- La [wiki SickFit](./wiki/index.md) raccoglie panoramica e collegamenti alla documentazione di progetto.
- Schemi dei componenti: [frontend web/PWA](./docs/components/frontend/SCHEMA.md), [backend Supabase](./docs/components/backend/SCHEMA.md) e [app mobile nativa](./docs/components/mobile/SCHEMA.md). Gli schemi descrivono il codice presente e distinguono ciò che è ancora solo previsto.
