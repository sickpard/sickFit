# Decisioni architetturali SickFit

**Aggiornato:** 21 novembre 2026. La direzione resta Supabase/Expo. Prima implementazione locale presente ma da ricontrollare; nessun provider cambiato. L’utente ha applicato le RPC SQL al database SickFit; la funzione Edge non è distribuita.

## Decisioni confermate

- **Repository:** mantenere la repository Git SickFit esistente e organizzarla come monorepo con `frontend/`, `backend/`, `mobile/`, `docs/` e `wiki/`. Non usare submodule.
- **Frontend web:** conservare l’applicazione Vue 3 + TypeScript + Vite attuale in `frontend/`.
- **Backend:** usare Supabase Edge Functions con TypeScript/Deno, mantenendo Supabase come unico provider backend e il database PostgreSQL/Auth esistenti.
- **Mobile:** usare Expo/React Native con TypeScript per una vera app Android/iOS, non una WebView.
- **Identità e dati:** mantenere lo stesso progetto Supabase, gli stessi account Auth e le stesse tabelle; non creare copie o provider paralleli.

## Stato implementato in questo checkout

- La PWA è stata spostata in `frontend/` con la sua configurazione e il lockfile. Vite legge le variabili d’ambiente dalla root del monorepo.
- `backend/supabase/functions/domain` contiene il sorgente locale dell’API v1 condivisa; `login-with-username` resta legacy. Nessuna funzione è attestata come deployata/provata.
- `docs/sickfit-domain.sql` definisce RPC invoker per le scritture atomiche; l’utente l’ha eseguita il 21 novembre 2026. Il readback catalogo ha confermato funzioni, RLS/policy e privilegi, senza test di esecuzione.
- Frontend e mobile contengono client UI per il contratto condiviso. Mobile dichiara dipendenze ma non ha lockfile e non è stato compilato/testato.

## Verifiche tecniche ancora necessarie

1. Riconciliare contratto, codice Edge, RPC SQL e client web/mobile.
2. Verificare schema live, RLS/grants, FK e trigger; la lettura live non è riuscita.
3. Testare concorrenza e atomicità RPC in database isolato, poi con due account distinti.
4. Verificare Auth redirect/deep link e sessione sicura su web, iOS e Android.
5. Definire rate limiting/quote, ambienti, pipeline e rollback prima di distribuire.
6. Consultare [`todo.md`](./todo.md) per ricontrolli obbligatori e stato delle verifiche.

## Vincoli

- Nessuna migrazione schema, modifica DB, modifica Auth, deploy o cambio remoto è autorizzato da queste decisioni.
- La Edge Function di login esistente ha `verify_jwt = false` per il flusso pre-autenticato e usa una service-role key lato server; prima di renderla pubblica occorre revisione specifica di rate limiting, CORS, segreti e gestione dei tentativi.
- Mantenere le sessioni storiche legate alla versione originaria del piano.
- Verifiche live di RLS, grants e impostazioni Auth sono separate dalla documentazione locale e restano da riconfermare prima di interventi backend.

Per lo stato operativo e l’elenco aggiornato delle attività, consultare [`todo.md`](./todo.md).
