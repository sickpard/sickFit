# SickFit backend

Direzione concordata: Supabase Edge Functions con TypeScript/Deno, sul progetto Supabase esistente. La struttura attuale conserva la configurazione `supabase/` e la funzione locale `login-with-username`.

## Stato

Non è ancora implementata un’API di dominio condivisa. La funzione di login è sorgente locale, non risulta deployata o provata, e richiede revisione di sicurezza prima di qualsiasi esposizione. La PWA usa ancora direttamente Supabase Auth e le tabelle Postgres.

Non sono presenti qui nuove dipendenze o un runtime Node separato. Non leggere né inserire credenziali; i segreti devono restare nell’ambiente server-side Supabase.

## Progettazione prima dell’implementazione API

Prima di aggiungere endpoint, definire risorse e contratto versionato, autenticazione JWT, propagazione del contesto utente/RLS, validazione, autorizzazione, limiti richieste, logging ed errori. Il passaggio dal client diretto all’API dovrà essere graduale e senza doppie scritture.

Vedere `../docs/architecture-decisions.md`, `../SCHEMA.md` e `../AGENTS.md`.
