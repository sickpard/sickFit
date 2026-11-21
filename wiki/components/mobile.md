---
title: "Client mobile nativo"
status: active
role: frontend
source:
  references:
    - part: component
      path: mobile/src/Root.tsx
    - part: configuration
      path: mobile/app.json
    - part: configuration
      path: mobile/package.json
    - part: service
      path: mobile/src/lib/domain.ts
---

## Short Description

`mobile/` contiene un client Expo/React Native per Android e iOS, distinto dalla PWA web.

## Description

Il sorgente include schermate di autenticazione, schede, editor, allenamento, storico e impostazioni. Auth usa Supabase direttamente; le operazioni di dominio usano il contratto `domain`. Le dipendenze, la build nativa e il comportamento su dispositivi non sono verificati in questo checkout.

## Functional Characteristics

- Presenta flussi UI per autenticazione, schede versionate, sessioni, storico e impostazioni.
- Usa SecureStore per la sessione Auth; i draft di allenamento restano in memoria.
- Non implementa un database locale o modalità offline.

## Interfaces And Protocols

La configurazione dichiara lo schema deep link `sickfit`; i callback email e il redirect devono essere verificati su iOS e Android. Il contratto dati condiviso è descritto in [`docs/api-contract.md`](../../docs/api-contract.md).

## Dependencies And Relationships

Dipende dallo stesso progetto Supabase e dal servizio `domain` usato dal web. Identificatori nativi, dipendenze installate, build e runtime restano da verificare. Consultare [`docs/components/mobile/SCHEMA.md`](../../docs/components/mobile/SCHEMA.md).
