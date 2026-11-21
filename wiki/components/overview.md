---
title: "Componenti SickFit"
status: active
role: application
source:
  references:
    - part: other
      path: README.md
    - part: configuration
      path: frontend/package.json
    - part: configuration
      path: mobile/package.json
    - part: endpoint
      path: backend/supabase/functions/domain/index.ts
---

## Short Description

Questa area distingue il client web, i servizi Supabase e il client nativo, documentando per ciascuno lo stato effettivo.

## Description

Il monorepo contiene una PWA Vue, sorgenti locali di Edge Functions Supabase e un client Expo/React Native con schermate per i flussi principali. La funzione `domain` e i client implementano un contratto condiviso locale; non risultano verifiche runtime, test o deploy nel checkout.

## Functional Characteristics

- La PWA e l’app mobile includono UI per autenticazione, schede, sessioni e storico.
- Il client mobile non è una WebView e usa lo stesso progetto Supabase.
- Le operazioni di dominio passano dal contratto locale `domain`; la disponibilità live non è verificata.

## Interfaces And Protocols

Auth usa Supabase direttamente; i dati di dominio usano `POST /functions/v1/domain` con il contratto descritto in [`docs/api-contract.md`](../../docs/api-contract.md).

## Dependencies And Relationships

I client condividono Supabase Auth e il servizio di dominio. Dettagli DB/API e limiti di verifica sono in [`docs/data-and-api-schema.md`](../../docs/data-and-api-schema.md); le schede tecniche sono in `docs/components/`.
