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
    - part: other
      path: mobile/App.tsx
---

## Short Description

SickFit è un monorepo per una web app di allenamento e i relativi componenti Supabase e mobile, con stato e limiti distinti per ciascuno.

## Description

Questa panoramica definisce il perimetro del repository. La PWA Vue costituisce il client web documentato; Supabase gestisce autenticazione e dati. `backend/` contiene configurazione e una Edge Function locale per il login con username, non un’API condivisa di dominio. `mobile/` è uno scaffold Expo/React Native con schermata segnaposto. I dettagli del prodotto sono nell’[area di allenamento](product/overview.md); i confini dei componenti sono nell’[area componenti](components/overview.md).

Le descrizioni del database e delle richieste applicative restano nel [contratto dati/API](../docs/data-and-api-schema.md). La presenza di codice o configurazioni locali non dimostra deployment o corretto funzionamento live.

## Functional Characteristics

- Manages schede e sessioni di allenamento nel frontend secondo i flussi descritti nell’[area prodotto](product/training-workflows.md).
- Shows lo storico e consente la selezione del tema chiaro/scuro nella PWA.
- Stores dati applicativi tramite Supabase secondo la configurazione del progetto; le policy live non sono verificate da questa panoramica.
- Non offre un’API di dominio condivisa, un’esperienza mobile nativa completa o uso offline documentato.

## Interfaces And Protocols

Il browser usa Supabase Auth e Data API; il flusso di login con username è rappresentato da una Edge Function locale. L’app mobile non ha ancora un’interfaccia dati implementata. Per i contratti e i limiti usare il [documento dati/API](../docs/data-and-api-schema.md).

## Dependencies And Relationships

Il frontend dipende da Supabase Auth/PostgreSQL. La funzione locale dipende dalla configurazione Supabase e da segreti server-side, che non devono essere esposti nel browser o nella documentazione. Lo scaffold mobile non ha ancora integrazioni applicative verificate.

## Procedures

Per configurazione e comandi di sviluppo consultare [README](../README.md) e [istruzioni operative](../AGENTS.md). Sulla VM non eseguire installazioni, test, build o avvio dell’app; sono ammesse solo verifiche statiche leggere secondo `AGENTS.md`.
