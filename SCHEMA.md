# SCHEMA.md — SickFit: schema dati e contratti API

> **Fonte di riferimento per il modello dati SickFit.** Descrive lo schema `public` osservato nel progetto Supabase e i contratti applicativi verificabili nei sorgenti. Non sostituisce il catalogo PostgreSQL live. Aggiornare questo file insieme a ogni modifica dello schema, migrazione o contratto API.
>
> **Verifica:** 2026-11-13, sola lettura tramite catalogo Supabase e ispezione dei sorgenti locali. Nessuna modifica al database è stata eseguita.

## 1. Panoramica

| Proprietà | Valore verificato |
|---|---|
| Applicazione | SickFit |
| Versione frontend | `0.1.0` (`package.json`) |
| Stack frontend | Vue 3, TypeScript, Vite |
| Persistenza/autenticazione | Supabase (PostgreSQL + Supabase Auth) |
| Schema applicativo | `public` |
| Riferimento progetto Supabase | `blljepmetnvfriqjdpcn` |
| Tabelle applicative osservate | 10 |
| RLS | abilitata su tutte le 10 tabelle osservate |
| Conteggio righe restituito dall’introspezione | 0 per ciascuna delle 10 tabelle alla data di verifica |
| Versione/ultima migrazione DB | non determinata: l’elenco migrazioni MCP era vuoto e nel tree locale non sono stati trovati file `.sql`; questo non prova che non siano mai state applicate modifiche DDL |

Il tool di introspezione fornisce colonne, tipi, nullabilità, default, check, chiavi primarie, chiavi esterne e alcuni attributi di unicità/generazione. Non restituisce la definizione DDL completa, le clausole `ON DELETE`/`ON UPDATE`, l’inventario completo degli indici, le espressioni delle policy RLS, i grants o il corpo dei trigger. Questi elementi sono segnati come non determinati, non ricostruiti per supposizione.

## 2. Principi e regole del dominio

### 2.1 Regole confermate dall’introspezione DB

- Le tabelle applicative hanno chiave primaria `id` di tipo `uuid`; i default `gen_random_uuid()` sono indicati dove esposti dal catalogo.
- Le tabelle con `user_id` hanno un riferimento a `auth.users(id)`; le relazioni composite tra i record applicativi includono `user_id` per vincolare i riferimenti allo stesso proprietario.
- `profiles.username` deve essere già trim-mato e rispettare `^[A-Za-z0-9._-]{3,32}$`. `username_normalized` è generato come `lower(btrim(username))` ed è unico secondo i metadati restituiti.
- I nomi di piani, giorni ed esercizi e il testo delle note non possono essere stringhe vuote dopo `btrim`, nei punti in cui il catalogo espone il relativo check.
- Le posizioni sono positive. Le versioni di piano hanno `version_number > 0`.
- `target_sets_min >= 0`; il catalogo non ha restituito un check equivalente per `target_sets_max` né un vincolo DB `max >= min`.
- Le serie consentono ripetizioni e durata nulle; se presenti, devono essere positive. Il peso può essere nullo, altrimenti è `>= 0`. `load_basis` ammette `per_side` o `total`.
- Gli stati DB ammessi sono: sessione `in_progress` o `completed`; esercizio svolto `completed` o `skipped`.

### 2.2 Invarianti di prodotto documentati nei sorgenti

- L’isolamento dei dati deve essere garantito da RLS, non soltanto dai filtri UI. Il catalogo conferma RLS abilitata su tutte le tabelle, ma non espone qui le condizioni di ogni policy: non dedurre che le policy siano corrette senza controllare il database.
- Un piano può avere più versioni. Le sessioni storiche devono restare associate alla versione e al giorno scelti; modifiche future non devono riscrivere gli allenamenti passati.
- Il numero di serie prescritto è indicativo: gli utenti possono registrare meno o più serie o saltare esercizi.
- I carichi sono espressi in kg. `per_side` significa “per lato”; `total` significa carico totale. Non effettuare conversioni implicite.
- Una serie può avere più note testuali, conservate senza interpretazione automatica.

Le regole di prodotto di questa sezione sono requisiti documentati; non tutte sono necessariamente enforce-ate da constraint SQL. Le verifiche di implementazione e sicurezza restano distinte dalla descrizione del modello.

## 3. Tabelle e colonne

**Convenzioni:** `Nullable = No` quando l’introspezione non riporta l’opzione `nullable`; i default e i check riportati sono trascritti dal catalogo. “—” significa che il dato non è stato restituito, non che sia stato verificato assente.

### 3.1 `profiles` — profilo applicativo associato all’utente Auth

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | — | PK; FK `auth.users(id)` |
| `username` | `text` | No | — | Trim obbligatorio; regex `^[A-Za-z0-9._-]{3,32}$` |
| `username_normalized` | `text` | Sì secondo metadati | Generata: `lower(btrim(username))` | Unica secondo metadati; usata per lookup case-insensitive |
| `created_at` | `timestamptz` | No | `now()` | Creazione |
| `updated_at` | `timestamptz` | No | `now()` | Ultimo aggiornamento; trigger effettivo non esposto dall’introspezione |

### 3.2 `training_plans` — schede di allenamento

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | No | — | FK `auth.users(id)`; proprietario |
| `name` | `text` | No | — | `btrim(name) <> ''` |
| `description` | `text` | Sì | — | Descrizione facoltativa |
| `archived_at` | `timestamptz` | Sì | — | Timestamp di archiviazione, se presente |
| `created_at` | `timestamptz` | No | `now()` | Creazione |
| `updated_at` | `timestamptz` | No | `now()` | Aggiornamento |

Chiavi esterne osservate: `user_id → auth.users(id)`. La coppia referenziata `(id, user_id)` è usata da `plan_versions`; dettagli completi di indice/constraint non esposti.

### 3.3 `plan_versions` — versioni immutabili delle schede

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | No | — | FK `auth.users(id)` |
| `training_plan_id` | `uuid` | No | — | FK composita `(training_plan_id,user_id) → training_plans(id,user_id)` |
| `version_number` | `integer` | No | — | `> 0` |
| `created_at` | `timestamptz` | No | `now()` | Creazione versione |

### 3.4 `plan_days` — giorni di una versione del piano

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | No | — | FK `auth.users(id)` |
| `plan_version_id` | `uuid` | No | — | FK composita `(plan_version_id,user_id) → plan_versions(id,user_id)` |
| `name` | `text` | No | — | `btrim(name) <> ''` |
| `position` | `integer` | No | — | `> 0`; ordine del giorno |
| `notes` | `text` | Sì | — | Note facoltative |
| `created_at` | `timestamptz` | No | `now()` | Creazione |

`workout_sessions` riferisce il giorno con `(plan_day_id,user_id,plan_version_id)`, così il giorno registrato è legato alla versione indicata.

### 3.5 `plan_exercises` — esercizi prescritti nel giorno

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | No | — | FK `auth.users(id)` |
| `plan_day_id` | `uuid` | No | — | FK composita `(plan_day_id,user_id) → plan_days(id,user_id)` |
| `name` | `text` | No | — | `btrim(name) <> ''` |
| `position` | `integer` | No | — | `> 0`; ordine dell’esercizio |
| `target_sets_min` | `integer` | No | `1` | `>= 0` |
| `target_sets_max` | `integer` | No | `1` | Nessun check min/max restituito dal catalogo |
| `is_optional` | `boolean` | No | `false` | Indica se l’esercizio è facoltativo |
| `prescription_notes` | `text` | Sì | — | Prescrizione facoltativa |
| `created_at` | `timestamptz` | No | `now()` | Creazione |

Relazioni osservate: alternative tramite `plan_exercise_alternatives`; sessione svolta tramite FK composita da `workout_exercises`.

### 3.6 `plan_exercise_alternatives` — alternative agli esercizi prescritti

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | No | — | FK `auth.users(id)` |
| `plan_exercise_id` | `uuid` | No | — | FK composita `(plan_exercise_id,user_id) → plan_exercises(id,user_id)` |
| `name` | `text` | No | — | `btrim(name) <> ''` |
| `position` | `integer` | No | — | `> 0`; ordine delle alternative |
| `created_at` | `timestamptz` | No | `now()` | Creazione |

### 3.7 `workout_sessions` — sessioni di allenamento

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | No | — | FK `auth.users(id)` |
| `plan_version_id` | `uuid` | No | — | Versione scelta; collegamento coerente al giorno attraverso la FK composita sottostante |
| `plan_day_id` | `uuid` | No | — | FK composita `(plan_day_id,user_id,plan_version_id) → plan_days(id,user_id,plan_version_id)` |
| `started_at` | `timestamptz` | No | `now()` | Inizio sessione |
| `completed_at` | `timestamptz` | Sì | — | Completamento |
| `status` | `text` | No | `'in_progress'` | Check: `in_progress` o `completed` |
| `notes` | `text` | Sì | — | Note facoltative |
| `created_at` | `timestamptz` | No | `now()` | Creazione |
| `updated_at` | `timestamptz` | No | `now()` | Aggiornamento |

Il catalogo non ha restituito una FK diretta separata da `plan_version_id` a `plan_versions`; la relazione del giorno comprende già `plan_version_id`. Non aggiungere o documentare un vincolo diretto senza verifica live.

### 3.8 `workout_exercises` — esercizi effettivamente svolti o saltati

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | No | — | FK `auth.users(id)` |
| `workout_session_id` | `uuid` | No | — | FK composita `(workout_session_id,user_id,plan_day_id) → workout_sessions(id,user_id,plan_day_id)` |
| `plan_day_id` | `uuid` | No | — | FK composita con la sessione e con l’esercizio pianificato |
| `plan_exercise_id` | `uuid` | Sì | — | FK composita `(plan_exercise_id,user_id,plan_day_id) → plan_exercises(id,user_id,plan_day_id)` |
| `selected_alternative_id` | `uuid` | Sì | — | FK composita `(selected_alternative_id,user_id,plan_exercise_id) → plan_exercise_alternatives(id,user_id,plan_exercise_id)` |
| `actual_name` | `text` | No | — | `btrim(actual_name) <> ''`; nome effettivamente svolto |
| `status` | `text` | No | `'completed'` | Check: `completed` o `skipped` |
| `replaces_workout_exercise_id` | `uuid` | Sì | — | FK ricorsiva composita sullo stesso utente e sessione |
| `position` | `integer` | No | — | `> 0`; ordine nella sessione |
| `notes` | `text` | Sì | — | Note facoltative |
| `created_at` | `timestamptz` | No | `now()` | Creazione |

### 3.9 `exercise_sets` — serie registrate per un esercizio svolto

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | No | — | FK `auth.users(id)` |
| `workout_exercise_id` | `uuid` | No | — | FK composita `(workout_exercise_id,user_id) → workout_exercises(id,user_id)` |
| `position` | `integer` | No | — | `> 0`; ordine della serie |
| `reps` | `integer` | Sì | — | Nullo o `> 0` |
| `weight_kg` | `numeric` | Sì | — | Nullo o `>= 0` |
| `load_basis` | `text` | No | `'per_side'` | Check: `per_side` o `total` |
| `duration_seconds` | `integer` | Sì | — | Nullo o `> 0` |
| `created_at` | `timestamptz` | No | `now()` | Creazione |

### 3.10 `set_notes` — note testuali associate a una serie

| Colonna | Tipo | Nullable | Default / generazione | Vincoli e significato |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | PK |
| `user_id` | `uuid` | No | — | FK `auth.users(id)` |
| `exercise_set_id` | `uuid` | No | — | FK composita `(exercise_set_id,user_id) → exercise_sets(id,user_id)` |
| `text` | `text` | No | — | `btrim(text) <> ''`; contenuto originale |
| `position` | `integer` | No | — | `> 0`; ordine della nota |
| `created_at` | `timestamptz` | No | `now()` | Creazione |

## 4. Relazioni

```mermaid
erDiagram
  auth_users ||--o| profiles : "id"
  auth_users ||--o{ training_plans : "user_id"
  auth_users ||--o{ plan_versions : "user_id"
  auth_users ||--o{ plan_days : "user_id"
  auth_users ||--o{ plan_exercises : "user_id"
  auth_users ||--o{ plan_exercise_alternatives : "user_id"
  auth_users ||--o{ workout_sessions : "user_id"
  auth_users ||--o{ workout_exercises : "user_id"
  auth_users ||--o{ exercise_sets : "user_id"
  auth_users ||--o{ set_notes : "user_id"
  training_plans ||--o{ plan_versions : "id,user_id"
  plan_versions ||--o{ plan_days : "id,user_id"
  plan_days ||--o{ plan_exercises : "id,user_id"
  plan_exercises ||--o{ plan_exercise_alternatives : "id,user_id"
  plan_days ||--o{ workout_sessions : "id,user_id,plan_version_id"
  workout_sessions ||--o{ workout_exercises : "id,user_id,plan_day_id"
  plan_exercises ||--o{ workout_exercises : "id,user_id,plan_day_id"
  plan_exercise_alternatives ||--o{ workout_exercises : "id,user_id,plan_exercise_id"
  workout_exercises ||--o{ workout_exercises : "replaces_workout_exercise_id"
  workout_exercises ||--o{ exercise_sets : "id,user_id"
  exercise_sets ||--o{ set_notes : "id,user_id"
```

`auth_users` rappresenta `auth.users`, gestita da Supabase e fuori dallo schema applicativo `public`. La cardinalità visualizzata è una guida alle FK osservate; non documenta regole di cancellazione, obbligatorietà applicativa o cardinalità garantite da vincoli non restituiti dal catalogo.

## 5. Indici, vincoli e integrità

### Indici osservati

- Chiave primaria su `id` per ciascuna delle 10 tabelle (l’indice fisico associato non è descritto separatamente dal tool).
- `profiles.username_normalized` risulta unico nei metadati restituiti.
- L’elenco completo degli indici secondari, dei nomi degli indici e delle colonne incluse non è stato restituito. Non assumere che esistano o manchino indici ulteriori; ricavare l’inventario dal catalogo live prima di modifiche di performance.

### FK e vincoli

Le FK riportate nelle tabelle sopra sono trascritte dai metadati Supabase, incluse le FK composite che portano `user_id` e gli identificatori di parent. Il catalogo interrogato non ha esposto comportamento `ON DELETE`/`ON UPDATE`, deferrability o tutte le constraint expressions. Consultare la definizione live prima di migrazioni o query distruttive.

### RLS e privilegi

RLS risulta abilitata su tutte le tabelle applicative. La verifica effettuata non ha restituito nomi/testi delle policy né grants per ruolo. Il requisito SickFit è isolamento per utente tramite RLS; prima di dichiarare o modificare una policy, verificare `USING`, `WITH CHECK`, ruoli destinatari e grants nel progetto live. Nessuna policy o privilegio viene creato da questo documento.

## 6. Regole di validazione dati

| Area | Regola DB osservata | Ulteriori regole applicative/documentate |
|---|---|---|
| Username | trim e regex 3–32 caratteri alfanumerici, punto, underscore o trattino; normalizzazione `lower(btrim(...))` | Lookup non sensibile a maiuscole/minuscole; email Auth deve corrispondere nel flusso login |
| Nomi scheda/giorno/esercizio/alternativa | non vuoti dopo `btrim` dove presente il check | limiti massimi e messaggi UI non sono definiti dal catalogo |
| Versione | `version_number > 0` | le modifiche future devono creare una nuova versione preservando lo storico |
| Posizioni | `position > 0` | ordinano gli elementi; non rappresentano un limite di quantità |
| Serie prescritte | `target_sets_min >= 0`; `target_sets_max` senza check esposto | Target indicativo; le serie effettive possono essere inferiori o superiori |
| Serie registrate | reps/durata null o positive; peso null o non negativo; modalità `per_side`/`total` | kg; niente conversione automatica; note multiple conservate separatamente |
| Stato sessione | `in_progress`, `completed` | il client aggiorna lo stato a `completed` al completamento |
| Stato esercizio | `completed`, `skipped` | un esercizio saltato non richiede serie |

L’import JSON/Notion e le relative regole di validazione non sono ancora implementati e quindi non fanno parte del contratto corrente.

## 7. Accesso dati e query pattern

Il client usa `@supabase/supabase-js` con `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. La chiave `service_role` non deve mai essere usata nel frontend.

Pattern letti nei sorgenti:

1. Schede: `training_plans`, filtro `archived_at IS NULL`, ordine `created_at DESC`.
2. Per ogni scheda: ultima `plan_versions` ordinata per `version_number DESC`, limite 1; poi giorni, esercizi e alternative ordinati per `position`.
3. Sessione: inserimento in `workout_sessions`, poi `workout_exercises`, `exercise_sets` e `set_notes`; infine aggiornamento sessione a `completed` con `completed_at`.
4. Storico: ultime 50 sessioni ordinate per `started_at DESC`, con lookup dei nomi di giorno, versione e scheda.
5. I filtri/proprietà che isolano i dati per utente devono restare garantiti da RLS; il comportamento effettivo delle policy non viene dedotto dalle query UI.

Non sono documentati piani di query, volumi attesi, benchmark o soglie di latenza. Non inventare target di performance; aggiungerli solo dopo una decisione di prodotto e misurazioni concordate.

## 8. Contratti API e autenticazione

### Frontend → Supabase Auth

- Registrazione: `auth.signUp` con email normalizzata in minuscolo, password e `username` in `user_metadata`. Il client può ricevere sessione oppure richiesta di conferma email.
- Stato sessione: persistenza, auto-refresh e rilevazione callback URL sono abilitate nella configurazione client.
- Le tabelle `public` sono raggiunte tramite Supabase JS/PostgREST; non esistono nel tree contratti REST custom separati per ciascuna tabella.

### Edge Function `login-with-username` — sola implementazione locale

- Invocazione dal client: `functions.invoke('login-with-username', { body })`.
- Metodo supportato dal sorgente: `POST`; `OPTIONS` per preflight. `verify_jwt = false` in `supabase/config.toml` perché l’accesso avviene prima della sessione.
- Request JSON: `{ "username": string, "email": string, "password": string }`.
- Il sorgente normalizza username/email, cerca il profilo per `username_normalized`, confronta l’email di `auth.users`, quindi delega la verifica password a `auth.signInWithPassword`.
- Successo nel sorgente: HTTP 200 con `{ "session": { "access_token": string, "refresh_token": string } }`; i token sono consegnati al client solo per `auth.setSession`.
- Errori definiti nel sorgente: 401 per credenziali/input non validi o eccezioni; 403 per origine CORS non consentita; 405 per metodo non consentito; 500 se la funzione non è configurata. La risposta credenziali non valide è generica.
- CORS nel sorgente: `http://localhost:5173` e origini da `SICKFIT_ALLOWED_ORIGINS`. Le risposte impostano `Cache-Control: no-store`.
- Segreti richiesti server-side dal sorgente: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (oppure `SUPABASE_ANON_KEY`) e `SUPABASE_SERVICE_ROLE_KEY`. Non riportare valori in questo file.

**Stato di distribuzione:** la funzione è solo sorgente locale e non risulta deployata/provata secondo README e AGENTS.md. Il contratto sopra descrive il sorgente, non un endpoint pubblicamente disponibile. Rate limiting e verifica della configurazione CORS restano prerequisiti di sicurezza prima di un deploy.

## 9. Migrazioni e storia dello schema

- `mcp__supabase__list_migrations` ha restituito un elenco vuoto alla verifica.
- La ricerca nel tree locale `supabase/` non ha trovato file di migrazione `.sql`; `supabase/config.toml` identifica il progetto e configura `login-with-username`.
- Non sono quindi determinati numero di versione DB, date/autori delle migrazioni o motivazioni delle modifiche DDL. Non interpretare un elenco vuoto come prova che lo schema non sia mai stato modificato.
- Quando saranno introdotte migrazioni autorizzate, registrare in questa sezione ID, data, motivazione e oggetti toccati, senza sostituire i sorgenti di migrazione.

## 10. Sicurezza e limiti di verifica

- Dati utente: isolamento tramite RLS richiesto; RLS enabled è verificato, ma policy e grants non sono enumerati in questo documento.
- Credenziali: solo publishable key nel client; service role esclusivamente server-side nella Edge Function.
- Non esporre token, password, chiavi o dati personali nei log e in SCHEMA.md.
- Nessuna query con dati utente è stata eseguita per produrre questo documento; il tool ha riportato zero righe per ogni tabella.
- Questa documentazione non è un audit di sicurezza e non certifica correttezza, completezza o conformità delle policy.

## 11. Aggiornamento e fonti

Aggiornare questo documento nella stessa modifica approvata che cambia tabelle, colonne, default, constraint, relazioni, RLS/grants, indici, funzioni o contratti API. Prima di ogni aggiornamento confrontare sorgenti/migrazioni e catalogo live in sola lettura. Tenere separate le informazioni DB confermate, le regole di prodotto e le lacune da verificare.

Fonti controllate per questa revisione:

- Catalogo Supabase `public` tramite tool read-only `list_tables` (`verbose=true`), progetto `blljepmetnvfriqjdpcn`.
- Elenco migrazioni Supabase tramite tool read-only `list_migrations`.
- Sorgenti locali: `package.json`, `src/lib/supabase.ts`, `src/lib/auth.ts`, `src/App.vue`, `supabase/config.toml`, `supabase/functions/login-with-username/index.ts`, `README.md`, `AGENTS.md`.

Dati non esposti dalle fonti disponibili — DDL integrale, indici completi, policy RLS/grants dettagliati, definizioni trigger, clausole di cancellazione e storia effettiva delle migrazioni — restano da verificare prima di documentarli come fatti.
