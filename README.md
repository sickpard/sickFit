# SickFit

PWA mobile-first per gestire schede, registrare allenamenti e consultare lo storico. Frontend Vue 3 + TypeScript + Vite; Supabase Auth e Postgres con RLS.

## Stato

Prima iterazione locale: UI italiana per registrazione/accesso, creazione di schede con più giorni ed esercizi, scelta manuale del giorno, registrazione di esercizi/serie/note e vista dello storico. L’app non usa dati demo e non conserva sessioni offline.

Il progetto non è ancora eseguibile in questa VM: l’installazione delle dipendenze è stata bloccata dalla protezione risorse. Non sono stati eseguiti test, build o deploy. Il login a tre campi richiede anche la Edge Function sotto `supabase/functions/login-with-username`, che al momento è solo sorgente locale e non è stata deployata. L’import JSON/Notion, il recupero password, la modifica/versionamento di schede esistenti e la scorciatoia home per il giorno corrente restano da completare.

## Ambiente di sviluppo

In un ambiente di sviluppo autorizzato, dalla root del progetto:

1. Copia `.env.example` in `.env.local` e inserisci `VITE_SUPABASE_URL` e la chiave *publishable* del progetto SickFit.
2. Installa le dipendenze con `npm install`.
3. Avvia Vite con `npm run dev`.
4. Esegui i test con `npm test`; `npm run build` è da eseguire solo quando autorizzato.

Non inserire mai nel frontend una chiave `sb_secret` o `service_role`. I file `.env*` sono ignorati da Git, tranne `.env.example`.

## Supabase

Le tabelle e le policy RLS sono state create nel progetto Supabase `sickfit`. Il file `supabase/functions/login-with-username/index.ts` implementa il controllo della coppia username/email e poi delega la verifica della password a Supabase Auth. La funzione richiede le variabili server-side `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (oppure `SUPABASE_ANON_KEY`) e `SUPABASE_SERVICE_ROLE_KEY`; non committarle e non inserirle nel frontend.

La funzione è configurata con `verify_jwt = false` perché viene chiamata prima che l’utente abbia una sessione. Prima di renderla disponibile pubblicamente è ancora necessaria una revisione del rate limiting e della configurazione CORS (`SICKFIT_ALLOWED_ORIGINS`). Non è stata distribuita né provata.

## PWA

Manifest e icone sono presenti. Non c’è service worker e non viene memorizzato contenuto per l’uso offline. L’installazione come PWA dipenderà anche dall’hosting HTTPS e dal browser.

## Git

La nuova PWA Vue è il contenuto corrente della root sul branch principale. La precedente applicazione Laravel viene rimossa dal tree attuale; la cronologia Git precedente resta conservata. `origin` punta a `git@github.com:sickpard/sickFit.git`.
