---
title: "Servizi Supabase"
status: active
role: platform_service
source:
  references:
    - part: configuration
      path: backend/supabase/config.toml
    - part: endpoint
      path: backend/supabase/functions/domain/index.ts
    - part: endpoint
      path: backend/supabase/functions/login-with-username/index.ts
---

## Short Description

`backend/supabase/` contiene configurazione e sorgenti locali delle Edge Functions SickFit.

## Description

La funzione `domain` espone nel codice locale operazioni di schede, sessioni e storico; `login-with-username` resta una funzione legacy configurata localmente. Nessuna delle due è attestata come distribuita o verificata in runtime.

## Functional Characteristics

- `domain` valida le richieste e usa il JWT dell’utente per accedere ai dati tramite RLS e RPC.
- `login-with-username` è una funzione separata; il nuovo flusso client usa Auth diretto e non ne richiede il deploy.
- Il codice presente non prova la disponibilità remota né il corretto comportamento del database.

## Interfaces And Protocols

Il contratto locale `domain` è documentato in [`docs/api-contract.md`](../../docs/api-contract.md) e nel README della funzione. Configurazioni e segreti server-side non vanno esposti ai client.

## Dependencies And Relationships

Le funzioni dipendono da Supabase Auth/PostgreSQL e dalle RPC del progetto. Lo schema e i limiti d’introspezione sono in [`docs/data-and-api-schema.md`](../../docs/data-and-api-schema.md); la scheda tecnica è [`docs/components/backend/SCHEMA.md`](../../docs/components/backend/SCHEMA.md).

## Procedures

Prima di un deploy servono autorizzazione specifica, revisione CORS/rate limiting/gestione segreti e test controllati. In questo checkout sono consentite soltanto verifiche statiche.
