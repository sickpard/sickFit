# AGENTS.md — SickFit

Queste istruzioni valgono per l’intero monorepo SickFit. Leggerle insieme a `README.md`, `SCHEMA.md` e alle pagine wiki pertinenti prima di intervenire.

## Ambito e architettura verificata

- `frontend/`: PWA web mobile-first Vue 3 + TypeScript + Vite; usa Supabase Auth e Data API direttamente. È online-only; manifest e icone sono presenti, ma non risulta un service worker.
- `backend/supabase/`: configurazione Supabase e sorgente locale della Edge Function `login-with-username`. Il codice presente non prova che la funzione sia stata distribuita o testata.
- `mobile/`: scaffold iniziale Expo/React Native con schermata segnaposto; autenticazione, funzioni di prodotto e runtime non sono implementati/verificati.
- `docs/`: decisioni, attività e documentazione dei componenti. `docs/data-and-api-schema.md` conserva il contratto dati/API; `docs/components/*/SCHEMA.md` descrivono frontend, backend e mobile.
- `wiki/`: documentazione funzionale e tecnica secondo lo schema alla root. La specifica editoriale del manuale utente è `wiki/user-manual-schema.md`.

## Prima di modificare

1. Verificare root Git, branch, remote e `git status --short --branch`; preservare il lavoro preesistente.
2. Consultare `SCHEMA.md`, `wiki/index.md`, l’overview e le pagine rilevanti; poi verificare manifest, configurazioni e sorgenti interessati.
3. Non leggere, stampare, copiare o registrare `.env*`, token, password, chiavi private o credenziali. Nei file d’esempio usare solo placeholder.
4. Non dedurre funzionalità, API, policy, deployment o percorsi dal nome di una directory o da un requisito.

## Sicurezza e vincoli operativi

- In questa VM sono consentite solo modifiche e verifiche statiche leggere. Non eseguire installazioni, test, build, compilazioni o avvio dell’app/dev server; non aggirare Heavyguard o altri controlli.
- Non usare una chiave `service_role` nel browser. Segreti server-side restano nell’ambiente Supabase e non devono comparire in frontend, Git o documentazione.
- Non modificare database, policy, grants, Auth, funzioni remote o deploy senza autorizzazione esplicita e verifica live dei prerequisiti.
- Le sessioni storiche devono restare associate alla versione di scheda originaria; carichi in kg e valori `per_side`/`total` non vanno convertiti implicitamente.

## Convenzioni

- Preservare componenti, route, chiavi di localizzazione, identificatori e contratti serializzati esistenti.
- I testi dell’interfaccia sono in italiano; mantenere letterali nomi di tabelle, campi e valori di protocollo.
- Non introdurre dipendenze o artefatti generati senza necessità verificata e autorizzazione.
- Distinguere sempre codice presente, requisiti, proposte e comportamento verificato in runtime.

## Documentazione

- `SCHEMA.md` definisce le regole della wiki; non è il modello PostgreSQL/API.
- `docs/data-and-api-schema.md` è il riferimento dati/API e dichiara esplicitamente i limiti dell’introspezione.
- `wiki/index.md` è l’indice; `wiki/overview.md` descrive il monorepo; le aree e sezioni vivono sotto `wiki/`.
- Dopo ogni modifica documentale aggiornare la wiki e i link interessati. Aggiornare anche la voce SickFit in `~/wiki/progetti.md` quando cambia lo stato documentale o tecnico.

## Verifica e consegna

Eseguire soltanto controlli statici leggeri autorizzati, inclusi `git diff --check` e controlli dei link. Dichiarare test, build, runtime e deploy non eseguiti. Prima della consegna verificare `git status --short` e preservare file non pertinenti. Commit e push richiedono autorizzazione esplicita per l’incarico corrente.