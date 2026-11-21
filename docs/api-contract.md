# Contratto applicativo SickFit — v1

Questa pagina descrive il contratto **locale** condiviso da PWA, app Expo ed Edge Function `domain`. Non attesta deploy, test con account reali o correttezza delle policy del progetto Supabase. Il modello dati è documentato in [data-and-api-schema.md](./data-and-api-schema.md); le funzioni SQL aggiuntive sono in [sickfit-domain.sql](./sickfit-domain.sql).

## Trasporto e autenticazione

- `POST /functions/v1/domain`, corpo JSON `{ "action": string, "payload": object }`; `OPTIONS` solo per CORS web.
- L'app effettua registrazione, accesso, recupero e rinnovo tramite Supabase Auth. Per le azioni di dominio invia il JWT della sessione nell'header `Authorization: Bearer …` e la chiave pubblicabile nell'header `apikey`; nessun `user_id` fornito dal client è attendibile.
- Successo `{ "data": T }`. Errore `{ "error": { "code": string, "message": string } }`, con stato HTTP pertinente. Le risposte non vanno memorizzate in cache. Il client non deve ripetere automaticamente le operazioni di scrittura dopo un timeout: prima ricarica lo stato dal server.
- Il contratto è versionato a livello documentale come **v1**; cambiare il significato dei campi o le operazioni richiede aggiornamento coordinato dei client. Non è stata ancora pubblicata una versione remota.

## Azioni

| Azione | `payload` | `data` |
| --- | --- | --- |
| `plans.list` | `{}` | `Plan[]` delle schede non archiviate, versione più recente |
| `plans.save` | `{name, planId?, days}` | `{id}` della scheda; creazione o nuova versione senza alterare le precedenti |
| `plans.archive` | `{planId}` | `{id}`; archiviazione logica senza cancellare lo storico |
| `workouts.start` | `{planVersionId, planDayId}` | `{id}` della sessione `in_progress` |
| `workouts.complete` | `{sessionId, exercises}` | `{id}`; scrittura atomica di esercizi, serie e note e completamento |
| `workouts.cancel` | `{sessionId}` | `{id}`; annullamento di una sessione ancora in corso |
| `history.list` | `{}` | fino a 50 sessioni più recenti e tutte le sessioni ancora in corso, incluso lo stato |
| `history.detail` | `{sessionId}` | sessione con esercizi, serie e note |

`Plan` = `{id, name, versionId, versionNumber, days: [{id, name, position, exercises: [{id, name, position, target_sets_min, target_sets_max, is_optional, prescription_notes, alternatives: [{id, name}]}]}]}`. Gli ID dei giorni/esercizi corrispondono alla versione restituita.

`plans.save.days` = `[{name, exercises: [{name, min, max, optional, notes, alternatives: string[]}]}]`. Posizioni assegnate nell'ordine degli array. Per una modifica si trasmette `planId` e si crea una nuova versione; il nome della scheda non cambia, perché lo storico usa la medesima etichetta. Nessuna scrittura parziale deve essere considerata valida.

`workouts.complete.exercises` = `[{planExerciseId, selectedAlternativeId?, actualName, status, sets: [{reps?, weightKg?, durationSeconds?, loadBasis, notes: string[]}]}]`. `status` è `completed` o `skipped`; `loadBasis` è `per_side` o `total`; `weightKg` è in kg e non viene convertito; `durationSeconds` è un intero positivo. Una serie può avere più note e un esercizio saltato non richiede serie. La sessione continua a riferire il giorno e la versione originari.

`history.list` restituisce `{id, started_at, status, plan_day_id, plan_version_id, planName, dayName}`. Include le 50 più recenti e tutte le sessioni `in_progress`, così una sessione aperta resta visibile. Il server serializza l’avvio e ne consente una sola per utente; se esistono sessioni aperte preesistenti, vanno annullate prima di avviarne un’altra. `history.detail` aggiunge `exercises: [{id, actual_name, status, position, notes, sets: [{id, position, reps, weight_kg, load_basis, duration_seconds, notes: [{text, position}]}]}]` allo stesso record. Lo storico non deve caricare implicitamente la versione attuale per interpretare una sessione passata.

## Installazione e verifica ancora necessarie

Il file SQL è stato eseguito dall’utente nel progetto SickFit il 21 novembre 2026. Il readback catalogo ha confermato le cinque funzioni, RLS/policy e privilegi effettivi previsti, ma non ne ha testato l’esecuzione. Prima del deploy della funzione `domain`, configurare le origini web ammesse e verificare login/conferma e recupero email, chiamate con due account separati, tentativi cross-account, rollback, concorrenza di versione, ripristino sessione e resa Android/iOS. Non distribuire `login-with-username` senza una revisione specifica: il nuovo accesso non ne richiede il deploy.
