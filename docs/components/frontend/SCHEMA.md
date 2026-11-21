# Schema componente — Frontend web/PWA

## Stato

Il sorgente locale è in `frontend/`. I flussi e l’integrazione remota non sono stati verificati runtime nel checkout; non dedurre disponibilità in produzione.

## Responsabilità e stack

Vue 3, TypeScript e Vite. Il client include autenticazione, gestione schede, sessioni, storico e preferenze UI. La UI è in italiano e online-only; non risulta un service worker.

## Integrazioni

- Supabase Auth diretto per signup, login, recupero e sessione.
- Le operazioni di dominio passano da `frontend/src/lib/domain.ts` alla Edge Function `domain` con il JWT utente.
- Il client usa solo URL e publishable key; nessuna chiave privilegiata nel browser.
- La lettura del profilo per validare il login dipende da policy RLS compatibile.

## Dati e invarianti

La scheda modificata crea una nuova versione; le sessioni storiche restano associate ai riferimenti originari. Il numero di serie prescritto è indicativo; le registrazioni ammettono serie variabili ed esercizi saltati. Carichi in kg, senza conversioni implicite.

## Limiti e verifiche

Nessun test, typecheck, build o runtime eseguito in questo checkout. L’Edge Function non risulta distribuita; conferma email, redirect, recupero, RLS e flussi multi-account restano da verificare.

Per schema e API consultare [`docs/data-and-api-schema.md`](../../data-and-api-schema.md) e [`docs/api-contract.md`](../../api-contract.md).
