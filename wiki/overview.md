# SickFit — panoramica

**Verificata:** 2026-11-19. Consultare `README.md` e `AGENTS.md` per stato e vincoli aggiornati.

## Prodotto

SickFit è una PWA mobile-first in italiano per gestire schede di allenamento, registrare sessioni e consultare lo storico. L’app è online-only: non implementa service worker, uso offline o sincronizzazione. La UI include tema chiaro/scuro con preferenza persistente sul dispositivo.

## Architettura

- **Frontend:** `frontend/`, Vue 3, TypeScript e Vite; al momento presenta l’app e accede direttamente a Supabase.
- **Autenticazione e dati:** Supabase Auth e PostgreSQL con RLS.
- **Backend:** direzione concordata — Supabase Edge Functions in TypeScript/Deno. `backend/supabase/functions/login-with-username` è sorgente locale preesistente, non risulta deployata o provata e non costituisce ancora un’API condivisa di dominio.
- **Mobile:** direzione concordata — Expo/React Native per Android e iOS. `mobile/` contiene ora uno scaffold TypeScript minimale con schermata segnaposto; dipendenze non installate, autenticazione e funzioni di prodotto non implementate.
- **PWA:** manifest e icone sono presenti; disponibilità installabile dipende dall’hosting HTTPS e dal browser.

La struttura è stata organizzata come monorepo (`frontend/`, `backend/`, `mobile/`, `docs/`, `wiki/`) senza creare un secondo provider: il database e l’identità restano Supabase. La direzione per backend e mobile è concordata; l’API condivisa e le funzioni applicative mobile non sono ancora implementate. Le attività aperte sono nel [TODO](../docs/todo.md).

## Funzioni presenti secondo la documentazione di progetto

Registrazione/accesso, schede con giorni ed esercizi, scelta manuale del giorno, registrazione di esercizi/serie/note e visualizzazione dello storico. Il README documenta inoltre versionamento delle schede, recupero password, import JSON e scorciatoia per l’allenamento del giorno come funzionalità implementate; i flussi Supabase live restano da verificare. L’import Notion non è implementato.

## Modello dati

Il progetto Supabase espone 10 tabelle applicative nello schema `public`; RLS risulta abilitata su tutte. L’utente ha confermato la configurazione di policy, grants e trigger, ma le espressioni live di policy e grants non sono state riportate nell’introspezione utilizzata per la documentazione. Dettagli verificati, relazioni e limiti noti sono nel [riferimento SCHEMA.md](../SCHEMA.md). Non eseguire modifiche DB o deploy senza autorizzazione esplicita.

## Vincoli operativi

`AGENTS.md` alla root contiene le istruzioni vincolanti per agenti e contributor. In questo intervento sono consentite solo verifiche statiche: non eseguire installazioni, test, build o avvio dell’app. Le verifiche runtime e la resa visiva restano da controllare in un ambiente autorizzato. Non inserire segreti nel frontend o nella documentazione; nessun commit o push senza richiesta esplicita.
