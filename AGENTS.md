# AGENTS.md — istruzioni operative SickFit

Queste istruzioni valgono per l’intera repository SickFit e prevalgono sulle convenzioni generiche quando più restrittive. Applicarle con `README.md`, `SCHEMA.md`, la wiki di progetto e le richieste correnti dell’utente.

## 1. Prima di intervenire

1. Verifica di essere nella root `/home/ubuntu/projects/personal/sickfit`; controlla branch e working tree e conserva ogni modifica preesistente.
2. Leggi questo file, `README.md`, `SCHEMA.md` e le pagine pertinenti di `wiki/`; ispeziona configurazione e sorgenti direttamente coinvolti. Non dedurre percorsi o funzionalità dai nomi.
3. Consulta `~/wiki/README.md`, `~/GUIDE/README.md` e la guida operativa pertinente prima di attività che ricadono nelle regole della VM.
4. Non leggere, stampare, copiare o registrare contenuti da file `.env*`, token, password, chiavi private o credenziali. `.env.example` può essere esaminato solo per i nomi delle variabili e i placeholder.

## 2. Ambito e architettura verificata

- SickFit è una PWA mobile-first in italiano, online-only, basata su Vue 3, TypeScript e Vite, con Supabase Auth/PostgreSQL.
- `frontend/` contiene la PWA Vue, i sorgenti, la configurazione Vite e il lockfile del frontend; verificare sempre il tree prima di riferire un simbolo.
- `backend/supabase/` contiene configurazione e sorgenti locali delle Edge Functions `domain` e `login-with-username`. Non dichiararle distribuite o verificate in runtime senza evidenza.
- `mobile/` contiene un client Expo/React Native con schermate per Auth, schede, sessioni e storico; dipendenze, build e runtime non sono verificati.
- La UI web usa tema chiaro/scuro. Non introdurre SQLite, server residenti sulla VM, bot, funzionalità offline o sincronizzazione. L’app mobile nativa è presente nel tree con schermate funzionali ma non è verificata in build/runtime; seguire `docs/architecture-decisions.md` e `docs/todo.md`. La scorciatoia per il workout del giorno è già documentata come implementata.

## 3. Schema dati e integrità

- `SCHEMA.md` alla root definisce le regole editoriali della wiki. Il riferimento canonico per dati e contratti API è `docs/data-and-api-schema.md`.
- Prima di modificare query, tipi, persistenza, autenticazione o funzioni Supabase, confronta l’implementazione con `docs/data-and-api-schema.md` e con le migrazioni/sorgenti realmente disponibili.
- Ogni modifica autorizzata a tabelle, colonne, default, vincoli, relazioni, indici, RLS/grants, trigger o contratti API richiede l’aggiornamento contestuale di `docs/data-and-api-schema.md` e della wiki. Non inventare DDL o comportamento non esposto dalle fonti; marca i dati ignoti come non verificati.
- L’isolamento per utente deve dipendere da RLS, non solo da filtri UI. Non modificare policy, grants, database o deploy senza autorizzazione esplicita.
- Le sessioni storiche devono restare associate alla versione di piano originaria. Non alterare gli allenamenti passati quando cambiano le schede.
- Il numero di serie prescritto è indicativo; le registrazioni possono avere più o meno serie o esercizi saltati. Carichi in kg, senza conversioni implicite.

## 4. Sicurezza e limiti operativi

- L’utente autorizza in modo continuativo soltanto modifiche con verifiche statiche sulla VM.
- Non eseguire sulla VM installazioni (inclusi `npm install`/`npm ci`), test, build, compilazioni o avvio dell’app/dev server. Non aggirare heavyguard con altri strumenti o ambienti sulla VM. Dichiarare tali verifiche non eseguite.
- Non usare una chiave `service_role` nel browser; il frontend può usare solo URL e publishable key. Segreti server-side restano in ambiente Supabase, mai in frontend, Git o documentazione.
- Prima di rendere pubblica/deployare la Edge Function, servono autorizzazione esplicita e revisione di rate limiting, CORS e gestione segreti.
- Nessun commit, push, release o deploy senza richiesta esplicita dell’utente.

## 5. Convenzioni di codice

- Preserva confini esistenti di componenti, template, stili, helper, chiavi di localizzazione, estensioni, endpoint, campi backend e contratti serializzati.
- Testi UI in italiano, coerenti con le convenzioni presenti. Mantieni letterali nomi di tabella/campo, valori di protocollo e identificatori.
- Mantieni separati stato di configurazione, stato runtime e stato di vista; evita logica duplicata tra componenti.
- Non aggiungere dipendenze, build artifact (`dist/`) o file generati senza necessità verificata e autorizzazione.

## 6. Documentazione e wiki

- `README.md`: stato, setup e limiti operativi del monorepo.
- `docs/`: decisioni, pianificazione, schema dati/API e schemi tecnici dei componenti.
- `docs/todo.md`: stato delle attività e dei prossimi passi.
- `SCHEMA.md`: regole editoriali della wiki; `docs/data-and-api-schema.md`: modello dati, vincoli, relazioni, sicurezza osservata, accesso dati e contratti API.
- `wiki/index.md`: indice; `wiki/overview.md`: panoramica del monorepo; le aree prodotto e componenti sono sotto `wiki/`.
- Prima di modificare documentazione, leggi `SCHEMA.md`, il contratto dati/API, `wiki/index.md`, le pagine target e le sorgenti pertinenti. Aggiorna la wiki di SickFit e gli indici/link coinvolti nella stessa attività.
- Dopo modifiche rilevanti al progetto aggiorna anche la voce SickFit in `~/wiki/progetti.md`; aggiorna TODO solo quando cambia lo stato di un’attività aperta.
- Distingui comportamento implementato, requisiti, esempi e ipotesi. Non inventare dati di prodotto, capacità, versioni, autori, policy o conformità normativa.

## 7. Verifica e consegna

- In questa VM sono ammesse solo verifiche statiche leggere e non invasive, ad esempio ispezione mirata dei file e `git diff --check`.
- Esegui `git diff --check` e `git status --short` prima della consegna, se consentito; non eseguire test, build, installazioni o runtime.
- Riporta esattamente quali controlli sono stati eseguiti e quali restano non verificati. Non affermare correttezza runtime, sicurezza completa o deploy senza prove.
- Non eliminare o sovrascrivere modifiche non correlate. Nessun commit o push senza richiesta esplicita.
