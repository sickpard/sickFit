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
---

## Short Description

Questa area separa il client web, i servizi Supabase e lo scaffold mobile senza confondere implementazione e obiettivi futuri.

## Description

Il repository contiene tre componenti con maturità diversa. La PWA web è il client di prodotto; `backend/supabase/` include configurazione e sorgente locale della funzione di login con username; `mobile/` contiene un progetto Expo/React Native segnaposto. Le pagine [frontend](frontend.md), [servizi Supabase](backend.md) e [mobile](mobile.md) sintetizzano i relativi confini. Gli schemi dettagliati in `docs/components/` restano la documentazione tecnica collegata.

## Functional Characteristics

- Shows una PWA web per i flussi di allenamento descritti nell’area prodotto.
- Configures una Edge Function locale per il login con username; la distribuzione non è verificata.
- Does not provide un’app mobile nativa funzionale o un’API condivisa di dominio.

## Interfaces And Protocols

La PWA comunica con Supabase. Non è definita un’interfaccia dati per lo scaffold mobile.

## Dependencies And Relationships

I componenti condividono il prodotto SickFit; solo il frontend ha flussi applicativi documentati. Il database/API è descritto in `docs/data-and-api-schema.md`.
