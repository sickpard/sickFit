---
title: "Prodotto SickFit"
status: active
role: functional_module
source:
  references:
    - part: component
      path: frontend/src/App.vue
    - part: model
      path: frontend/src/lib/workout.ts
    - part: component
      path: mobile/src/Root.tsx
---

## Short Description

SickFit consente di definire schede di allenamento, registrare sessioni e consultare lo storico tramite client web e nativo.

## Description

Le schede comprendono giorni ed esercizi; le sessioni registrano esercizi svolti o saltati, serie e note. Le modifiche alle schede creano nuove versioni affinché le sessioni passate mantengano i riferimenti originari. La UI è presente nei sorgenti web e mobile; i flussi remoti non sono stati verificati in questo checkout.

## Functional Characteristics

- Gestisce schede, giorni, esercizi e alternative.
- Registra sessioni, serie, carichi, ripetizioni, durata e note secondo il contratto locale.
- Mostra storico e preferenza tema nel client web; il mobile ha schermate per i flussi principali.
- L’importazione Notion non è implementata; verificare lo stato dell’import JSON nei sorgenti prima di documentare la procedura.

## Interfaces And Protocols

Auth usa Supabase Auth; le operazioni di dominio passano dalla Edge Function `domain`. Il contratto è in [`docs/api-contract.md`](../../docs/api-contract.md); schema e limiti sono in [`docs/data-and-api-schema.md`](../../docs/data-and-api-schema.md).

## Dependencies And Relationships

La sessione è legata al giorno e alla versione della scheda selezionata. Serie e note appartengono agli esercizi registrati. Le operazioni live richiedono l’API e le RPC attive; il loro comportamento non è verificato qui.

## Procedures

Per le procedure utente, verificare i flussi nella versione target prima della pubblicazione. Lo [schema editoriale del manuale](../user-manual-schema.md) è una proposta e non sostituisce la verifica runtime.
