---
title: "SickFit — panoramica del monorepo"
status: active
role: application
source:
  references:
    - part: other
      path: README.md
    - part: configuration
      path: frontend/package.json
    - part: configuration
      path: backend/supabase/config.toml
    - part: configuration
      path: mobile/package.json
    - part: other
      path: docs/api-contract.md
---

## Short Description

SickFit è un monorepo con client web e nativo per la gestione di allenamenti, integrati con Supabase.

## Description

La PWA Vue e il client Expo/React Native includono schermate per autenticazione, schede, sessioni e storico. Supabase Auth gestisce l’identità; le operazioni di dominio sono descritte dal contratto locale v1 e dalla Edge Function `domain`. Il sorgente locale non prova deploy o corretto funzionamento runtime.

## Functional Characteristics

- Gestisce schede di allenamento, versioni, sessioni e storico nei client locali.
- È previsto l’uso online tramite Supabase; non è documentato un flusso offline o un service worker.
- L’import Notion non è implementato.
- Per stato e verifiche mancanti consultare il [TODO](../docs/todo.md).

## Interfaces And Protocols

Auth usa Supabase direttamente; i dati di dominio passano dal contratto locale `POST /functions/v1/domain`. I dettagli sono in [`docs/api-contract.md`](../docs/api-contract.md) e [`docs/data-and-api-schema.md`](../docs/data-and-api-schema.md).

## Dependencies And Relationships

I componenti condividono il progetto Supabase. Le pagine del [prodotto](product/overview.md) e dei [componenti](components/overview.md) descrivono i confini; gli schemi DB/API e i limiti dell’introspezione sono documentati separatamente.

## Procedures

Per setup e vincoli operativi consultare [README](../README.md) e [AGENTS](../AGENTS.md). L’utente ha già avviato Vite e confermato signup/email; test, build, runtime mobile e deploy non sono attestati da questa revisione.
