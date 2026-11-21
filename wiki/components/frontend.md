---
title: "Frontend web e PWA"
status: active
role: frontend
source:
  references:
    - part: component
      path: frontend/src/App.vue
    - part: service
      path: frontend/src/lib/domain.ts
    - part: service
      path: frontend/src/lib/supabase.ts
    - part: other
      path: frontend/public/manifest.webmanifest
---

## Short Description

Il frontend è una PWA Vue 3 in italiano, mobile-first e online-only.

## Description

Il client web vive in `frontend/` e usa Vue 3, TypeScript, Vite e Supabase JS. Implementa autenticazione e UI per schede, sessioni, storico e impostazioni. Auth comunica direttamente con Supabase; le operazioni di dominio invocano la Edge Function `domain` secondo il contratto locale.

## Functional Characteristics

- Gestisce schede versionate, sessioni, storico e preferenza tema.
- La sessione e i dati di dominio non sono disponibili offline; non risulta un service worker.
- Il codice locale non dimostra che l’API sia distribuita o che i flussi siano accettati in runtime.

## Interfaces And Protocols

Auth usa Supabase Auth. Le azioni di dominio usano `POST /functions/v1/domain`; payload e DTO sono definiti in [`docs/api-contract.md`](../../docs/api-contract.md).

## Dependencies And Relationships

Dipende da Supabase Auth, dall’Edge Function `domain` per le operazioni di dominio e dai pacchetti di `frontend/package.json`. Per i dettagli tecnici consultare [`docs/components/frontend/SCHEMA.md`](../../docs/components/frontend/SCHEMA.md).
