# SickFit `domain` — contratto locale v1

Sorgente della funzione solo locale: nessuna funzione distribuita o test runtime attestato. Il 21 novembre 2026 l’utente ha eseguito lo script SQL delle RPC nel progetto SickFit; un readback catalogo le ha confermate presenti insieme ai prerequisiti RLS/grants previsti. Le RPC non sono state invocate. Non modifica il login legacy `login-with-username`; frontend e mobile dipendono dalla funzione `domain` non distribuita. `SCHEMA.md` resta il riferimento per lo schema osservato.

## Invocazione

`POST /functions/v1/domain` con JSON `{ "action": "…", "payload": { … } }`. `Content-Type: application/json`; client autenticato: `Authorization: Bearer <user access JWT>` e `apikey: <publishable key>` (la chiamata `supabase.functions.invoke('domain', { body })` li invia attraverso supabase-js dopo il login). `backend/supabase/config.toml` imposta esplicitamente `verify_jwt = true` per `domain`; il codice richiama `auth.getUser(token)` e crea un client *per richiesta* con publishable key e JWT per PostgREST/RPC. `user_id` non è mai accettato nel payload. La service-role key non è utilizzata da questa funzione.

Successo HTTP 200: `{ "data": ... }`. Errore: `{ "error": { "code": string, "message": string } }`. Errori previsti: `INVALID_INPUT` (400), `UNKNOWN_ACTION` (400), `UNAUTHORIZED` (401 dal codice; la verifica JWT di piattaforma può restituire 401 prima del codice), `FORBIDDEN_ORIGIN` (403), `NOT_FOUND` (404), `METHOD_NOT_ALLOWED` (405), `CONFLICT` (409), `DATA_ERROR` (500), `INTERNAL_ERROR` (500), `NOT_CONFIGURED` (503). Gli errori inattesi DB non vengono esposti al chiamante. Nessuna garanzia di idempotenza sui retry di `plans.save`/`workouts.start`: verificare lo stato prima di ripetere. CORS: `http://localhost:5173` e valori espliciti di `SICKFIT_ALLOWED_ORIGINS`; non c'è wildcard. Preflight `OPTIONS` → 204 solo per origini ammesse; richieste senza `Origin` (client nativi) sono ammesse. Risposte `no-store`.

## Azioni

| `action` | `payload` | `data` |
|---|---|---|
| `plans.list` | `{}` | Array delle schede non archiviate, con sola versione più recente |
| `plans.save` | `{name, planId?, days:[{name, exercises:[{name,min,max,optional,notes,alternatives:string[]}]}]}` | `{id: planId}` |
| `plans.archive` | `{planId}` | `{id: planId}` |
| `workouts.start` | `{planVersionId,planDayId}` | `{id: sessionId}` |
| `workouts.complete` | `{sessionId,exercises:[{planExerciseId,selectedAlternativeId?,actualName,status,sets:[{reps?,weightKg?,durationSeconds?,loadBasis,notes:string[]}]}]}` | `{id: sessionId}` |
| `workouts.cancel` | `{sessionId}` | `{id: sessionId}` |
| `history.list` | `{}` | 50 sessioni più recenti più tutte le sessioni `in_progress` |
| `history.detail` | `{sessionId}` | Una sessione con esercizi, serie e note |

Scheda restituita: `{id,name,versionId,versionNumber,days:[{id,name,position,exercises:[{id,name,position,target_sets_min,target_sets_max,is_optional,prescription_notes,alternatives:[{id,name}]}]}]}`. Le posizioni sono 1-based, ordinate. `prescription_notes` è stringa oppure `null`.

Elemento dello storico: `{id,started_at,status,plan_day_id,plan_version_id,planName,dayName}`. Dettaglio: stessi campi, più `exercises:[{id,actual_name,status,position,notes,sets:[{id,position,reps,weight_kg,load_basis,duration_seconds,notes:[{text,position}]}]}]`. `notes` dell'esercizio, `reps`, `weight_kg` e `duration_seconds` possono essere `null`; `load_basis` è `per_side` o `total`. La v1 accetta `durationSeconds` intero positivo. Il nome storico del piano deriva da `training_plans.name`, quindi il salvataggio di una nuova versione rifiuta (`CONFLICT`) la rinomina del piano. Giorno/versione e record di esercizio restano associati agli ID originali. Lo storico include anche sessioni `in_progress`.

`plans.save` crea una scheda e versione 1 oppure blocca una scheda esistente non archiviata e aggiunge una versione; non sovrascrive versioni precedenti. `workouts.start` accetta un giorno della versione indicata di una scheda non archiviata, anche se la versione non è l'ultima; serializza gli avvii per utente e rifiuta una nuova sessione se ne esiste già una `in_progress`. `history.list` include tutte le sessioni aperte così non spariscono dietro al limite delle 50 completate/recenti. `workouts.complete` è atomico: sessione `in_progress`, nessun esercizio già persistito, ogni esercizio pianificato appartiene al giorno della sessione, alternativa eventualmente scelta appartiene all'esercizio; ciascun esercizio prescritto compare al massimo una volta. È possibile registrare zero serie su un esercizio `completed`; un esercizio `skipped` deve avere zero serie. I target sono solo indicativi. `workouts.cancel` elimina *solo* una sessione `in_progress` senza esercizi già persistiti; non presume `ON DELETE CASCADE`, non cancella una sessione completata e non nasconde fallimenti RLS. `plans.archive` imposta `archived_at`, senza cancellare lo storico. Nessuna conversione dei pesi: `weightKg` è in kg.

Limiti di input: corpo massimo 256000 byte; da 1 a 31 giorni, da 1 a 100 esercizi per giorno, fino a 20 alternative, min/max interi 0…9999 e max≥min; sessione da 1 a 100 esercizi, fino a 100 serie per esercizio e 20 note per serie. Nomi fino a 160 caratteri non vuoti, note fino a 2000; ripetizioni intere positive fino a 1000000, peso numerico finito 0…1000000, durata intera positiva entro il limite `integer` PostgreSQL. `loadBasis` è obbligatorio. I campi sconosciuti nel JSON Edge sono rifiutati; le RPC replicano la validazione essenziale per invocazioni dirette. Le RPC devono essere autorizzate soltanto a `authenticated`; la sicurezza effettiva richiede policy RLS e grants sulle tabelle coerenti.

## Prima di un eventuale deploy

`docs/sickfit-domain.sql` è stato eseguito nel progetto SickFit il 21 novembre 2026: crea cinque funzioni `SECURITY INVOKER`, non le policy sulle nove tabelle. Un readback catalogo ha confermato le policy owner-scoped, i privilegi tabellari effettivi richiesti, le colonne/FK/check e i trigger `updated_at`. Non sono stati testati le RPC, due account, isolamento runtime, transazioni/versioni concorrenziali o l’Edge Function. Gli esempi commentati di policy/grants per archive/delete sono opt-in e non vengono applicati dallo script. Verificare anche CORS delle origini di produzione, rate limiting/quote e comportamento del gateway `verify_jwt` prima di distribuire. Non sono stati installati pacchetti né eseguiti test/build/runtime.
