# SickFit — panoramica

**Aggiornata:** 2026-11-21. Prima implementazione locale presente; ricontrollare attentamente secondo `docs/todo.md`. Non sono stati eseguiti test/build/runtime, SQL remoto o deploy.

## Prodotto

SickFit è una PWA mobile-first in italiano per gestire schede di allenamento, registrare sessioni e consultare lo storico. L’app è online-only: non implementa service worker, uso offline o sincronizzazione. La UI include tema chiaro/scuro con preferenza persistente sul dispositivo.

## Architettura

- **Frontend:** `frontend/`, Vue 3, TypeScript e Vite; Auth diretto a Supabase, operazioni di dominio tramite invocazione locale dell’Edge Function `domain`.
- **Autenticazione e dati:** Supabase Auth e PostgreSQL con RLS.
- **Backend:** `backend/supabase/functions/domain` espone nel sorgente locale il contratto v1; `login-with-username` resta legacy. Nessuna funzione è attestata come deployata/provata.
- **Mobile:** `mobile/` contiene schermate Expo/React Native TypeScript per Auth, schede, sessioni e storico; dipendenze non installate, lockfile non presente, runtime non verificato.
- **PWA:** manifest e icone sono presenti; disponibilità installabile dipende dall’hosting HTTPS e dal browser.

La struttura resta un monorepo, con Supabase come unico provider. Il contratto condiviso e il SQL RPC sono descritti in [`docs/api-contract.md`](../docs/api-contract.md) e [`docs/sickfit-domain.sql`](../docs/sickfit-domain.sql). Il SQL è stato eseguito nel progetto SickFit il 21 novembre 2026; le funzioni sono presenti secondo il readback catalogo, ma non sono ancora state invocate e l’Edge Function non è distribuita. Le attività da ricontrollare sono nel [TODO](../docs/todo.md).

## Funzioni presenti secondo la documentazione di progetto

Registrazione/accesso, schede con giorni ed esercizi, scelta manuale del giorno, registrazione di esercizi/serie/note e visualizzazione dello storico. Il README documenta inoltre versionamento delle schede, recupero password, import JSON e scorciatoia per l’allenamento del giorno come funzionalità implementate; i flussi Supabase live restano da verificare. L’import Notion non è implementato.

## Modello dati

La lettura catalogo del 21 novembre 2026 ha verificato RLS abilitata e policy owner-scoped sulle nove tabelle di dominio, oltre ai privilegi tabellari effettivi richiesti e alle funzioni RPC. Il readback non ha testato l’isolamento con account reali né l’esecuzione delle RPC. Dettagli e limiti sono nel [riferimento SCHEMA.md](../SCHEMA.md).

## Vincoli operativi

`AGENTS.md` alla root contiene le istruzioni vincolanti per agenti e contributor. In questo intervento sono consentite solo verifiche statiche: non eseguire installazioni, test, build o avvio dell’app. Le verifiche runtime e la resa visiva restano da controllare in un ambiente autorizzato. Non inserire segreti nel frontend o nella documentazione; nessun commit o push senza richiesta esplicita.
