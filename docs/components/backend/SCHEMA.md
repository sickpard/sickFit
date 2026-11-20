# SickFit — SCHEMA componente backend

## Scopo e stato

SickFit usa Supabase gestito per identità e dati. Nel monorepo `backend/` contiene la configurazione Supabase e una Edge Function Deno preesistente; non contiene un server Node/Express o un’API di dominio condivisa. Il browser continua ad accedere direttamente a Supabase Auth e alla Data API.

Le directory sorgente effettive sono `backend/supabase/config.toml` e `backend/supabase/functions/login-with-username/index.ts`. La funzione risulta codice locale nei documenti di progetto, non attestazione di deploy o runtime verificato.

## Servizi gestiti

### Supabase Auth

Gestisce signup, login e sessione dell’utente. Il frontend usa Supabase JS con persistenza e auto-refresh. Signup conserva username nei metadata del profilo; recupero password usa l’email e la callback Auth. Lo stato live di redirect, email confirmation e policy Auth va verificato prima di interventi.

### PostgreSQL e Data API

- Il database applicativo è nello schema `public`; il modello osservato è descritto nel [contratto dati/API](../../data-and-api-schema.md).
- Supabase JS invia richieste al database/PostgREST dal browser con publishable key e token della sessione. Per le query di prodotto non c’è un server applicativo intermedio.
- L’isolamento per utente dipende da RLS, grants e vincoli effettivi. Il fatto che RLS sia abilitata non prova da solo che ogni policy sia corretta.
- Non dedurre DDL, policy o migrazioni da questo file e non rieseguire SQL senza verifica live e autorizzazione.

## Edge Function `login-with-username`

Sorgente: `backend/supabase/functions/login-with-username/index.ts`, runtime Deno/Supabase Edge Functions con `@supabase/supabase-js`. `backend/supabase/config.toml` associa la funzione alla configurazione Supabase del progetto e imposta `verify_jwt = false` perché il login avviene prima di avere una sessione.

### Flusso nel sorgente

1. Accetta `OPTIONS` per il preflight e `POST` per il login; gli altri metodi ricevono `405`.
2. Confronta l’origine con `http://localhost:5173` e gli eventuali valori ammessi da `SICKFIT_ALLOWED_ORIGINS`; origini non consentite ricevono `403`.
3. Legge username, email e password; username/email vengono trim-mati e convertiti in minuscolo.
4. Usa il client admin per trovare `profiles.username_normalized` e recuperare l’utente Auth corrispondente.
5. Confronta l’email e delega la verifica della password a `auth.signInWithPassword` usando il client public.
6. Se il login riesce, restituisce `access_token` e `refresh_token`; il frontend li passa a `supabase.auth.setSession()`.

Il sorgente richiede server-side `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (oppure `SUPABASE_ANON_KEY` secondo il codice), `SUPABASE_SERVICE_ROLE_KEY` e, se necessarie, origini in `SICKFIT_ALLOWED_ORIGINS`. Sono riportati solo nomi di variabili, mai valori. La service-role key è privilegiata e non deve essere esposta al browser, in `VITE_*`, nei log o in Git.

### Limiti operativi e sicurezza

Il codice mostrato non include un rate limiter applicativo. Poiché `verify_jwt` è disabilitato per il flusso pre-sessione, l’esposizione richiede revisione anti-abuso, allowlist CORS, gestione dei segreti e test controllati. Non dichiarare deploy, disponibilità o correttezza live senza read-back. Nessun deploy o modifica di Auth/database è autorizzato da questo schema.

## Flusso complessivo attuale

`Browser → Supabase Auth (sessione) → Supabase Data API/PostgreSQL (query e scritture con RLS)`.

Il solo login username passa dalla Edge Function prima che esista la sessione. Non sono presenti endpoint custom per schede, sessioni o storico; nessuna API REST Node/Express va descritta come implementata.

## Non implementato / da non presumere

- API di dominio condivisa o server Node/Express.
- Import Notion o altri servizi custom.
- Rate limiting applicativo nella funzione username.
- Deploy/runtime verificato della funzione, policy RLS complete o autenticazione live funzionante.
- Migrazioni SQL locali nel percorso `backend/supabase/`.

Per il client e le query vedere lo [schema frontend](../frontend/SCHEMA.md); per lo scaffold nativo e il target mobile vedere lo [schema mobile](../mobile/SCHEMA.md).
