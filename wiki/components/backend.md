---
title: "Servizi Supabase"
status: active
role: platform_service
source:
  references:
    - part: configuration
      path: backend/supabase/config.toml
    - part: endpoint
      path: backend/supabase/functions/login-with-username/index.ts
---

## Short Description

Il componente backend SickFit contiene configurazione Supabase e sorgente locale di una Edge Function per il login con username.

## Description

`backend/supabase/` non è un server applicativo condiviso. La funzione `login-with-username` è descritta come codice locale che verifica username/email e delega l’autenticazione a Supabase Auth. La configurazione del progetto non dimostra che la funzione sia distribuita o disponibile in un ambiente remoto.

## Functional Characteristics

- Validates l’input del login nel sorgente locale della Edge Function.
- Does not provide un’API condivisa per schede, sessioni o storico.
- Does not have deployment/runtime verificato in questa documentazione.

## Interfaces And Protocols

Il browser invoca Supabase Auth/Data API; il login con username è progettato per passare dalla Edge Function. Contratto, payload, errori e requisiti di sicurezza sono nel [contratto dati/API](../../docs/data-and-api-schema.md).

## Dependencies And Relationships

Dipende dal progetto Supabase e da segreti server-side. Non inserire `service_role` in variabili client o documentazione.

## Procedures

Prima di distribuire la funzione servono autorizzazione esplicita, revisione anti-abuso/rate limiting, CORS, gestione segreti e test controllati. La VM non è autorizzata per deploy o verifiche runtime.
