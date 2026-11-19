# Decisioni architetturali SickFit

**Aggiornato:** 19 novembre 2026. Decisioni concordate in chat; nessun provider o database remoto modificato.

## Decisioni confermate

- **Repository:** mantenere la repository Git SickFit esistente e organizzarla come monorepo con `frontend/`, `backend/`, `mobile/`, `docs/` e `wiki/`. Non usare submodule.
- **Frontend web:** conservare l’applicazione Vue 3 + TypeScript + Vite attuale in `frontend/`.
- **Backend:** usare Supabase Edge Functions con TypeScript/Deno, mantenendo Supabase come unico provider backend e il database PostgreSQL/Auth esistenti.
- **Mobile:** usare Expo/React Native con TypeScript per una vera app Android/iOS, non una WebView.
- **Identità e dati:** mantenere lo stesso progetto Supabase, gli stessi account Auth e le stesse tabelle; non creare copie o provider paralleli.

## Stato implementato in questo checkout

- La PWA è stata spostata in `frontend/` con la sua configurazione e il lockfile. Vite legge le variabili d’ambiente dalla root del monorepo.
- La configurazione Supabase e la Edge Function locale esistente sono in `backend/supabase/`.
- `backend/supabase/functions/login-with-username` è solo sorgente preesistente: non è attestata come deployata o provata e non costituisce l’API applicativa condivisa.
- `mobile/` contiene un scaffold Expo/React Native TypeScript iniziale e una schermata segnaposto. I pacchetti non sono stati installati, il lockfile non è stato generato e non sono stati creati file nativi.

## Prossime decisioni tecniche da definire prima dell’API

1. Elenco degli endpoint e delle operazioni di dominio da spostare dal client.
2. Strategia di versione e forma del contratto API (per esempio OpenAPI).
3. Modalità per propagare e validare la sessione Supabase Auth nelle Edge Functions e garantire RLS; evitare uso generalizzato della service-role key.
4. Sequenza di passaggio dal client Supabase diretto alle API, senza doppie scritture.
5. Gestione dei redirect/deep link Auth per web, Android e iOS.
6. Ambienti di test isolati, criteri di rollback e pipeline CI/deploy indipendenti per componente.

## Vincoli

- Nessuna migrazione schema, modifica DB, modifica Auth, deploy o cambio remoto è autorizzato da queste decisioni.
- La Edge Function di login esistente ha `verify_jwt = false` per il flusso pre-autenticato e usa una service-role key lato server; prima di renderla pubblica occorre revisione specifica di rate limiting, CORS, segreti e gestione dei tentativi.
- Mantenere le sessioni storiche legate alla versione originaria del piano.
- Verifiche live di RLS, grants e impostazioni Auth sono separate dalla documentazione locale e restano da riconfermare prima di interventi backend.

Per lo stato operativo e l’elenco aggiornato delle attività, consultare [`todo.md`](./todo.md).
