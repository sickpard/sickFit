---
title: "Frontend web e PWA"
status: active
role: frontend
source:
  references:
    - part: component
      path: frontend/src/App.vue
    - part: service
      path: frontend/src/lib/supabase.ts
    - part: other
      path: frontend/public/manifest.webmanifest
---

## Short Description

Il frontend SickFit è una PWA web Vue 3, responsive, in italiano e orientata all’uso online.

## Description

Il client vive in `frontend/` e usa Vue 3, TypeScript e Vite. La UI coordina accesso, schede, sessioni e storico; Supabase JS fornisce l’interfaccia Auth/Data API. Il manifest e le icone sono presenti, ma non risulta un service worker: non documentare supporto offline. Il tema chiaro/scuro usa una preferenza locale.

## Functional Characteristics

- Shows le viste web per i flussi di allenamento documentati.
- Stores la preferenza del tema sul dispositivo.
- Does not store sessioni offline e non dispone di sincronizzazione offline documentata.

## Interfaces And Protocols

Il browser usa Supabase Auth e Data API tramite Supabase JS; le variabili frontend devono contenere solo valori pubblici.

## Dependencies And Relationships

Dipende da Supabase per identità e dati e dai pacchetti dichiarati in `frontend/package.json`. Per i dettagli tecnici consultare [`docs/components/frontend/SCHEMA.md`](../../docs/components/frontend/SCHEMA.md).
