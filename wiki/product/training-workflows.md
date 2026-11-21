---
title: "Schede, sessioni e storico"
status: active
role: functional_module
source:
  references:
    - part: component
      path: frontend/src/App.vue
    - part: model
      path: frontend/src/lib/workout.ts
    - part: service
      path: frontend/src/lib/domain.ts
    - part: component
      path: mobile/src/screens/WorkoutScreen.tsx
---

## Short Description

Questa pagina descrive i flussi di programmazione, registrazione e consultazione degli allenamenti rappresentati nei client SickFit.

## Description

Una scheda raggruppa giorni ed esercizi e può includere alternative e note. Le modifiche alla scheda creano una versione nuova; le sessioni conservano il collegamento alla versione originaria. Durante una sessione si registrano esercizi svolti o saltati, serie effettive e note.

## Functional Characteristics

- I sorgenti web e mobile includono UI per schede, allenamenti e storico.
- Il contratto locale prevede creazione/versionamento, archiviazione, avvio/completamento/annullamento sessione e dettaglio storico.
- Le richieste di dominio sono separate e non costituiscono una transazione client unica; le scritture composte sono delegate a RPC.
- Questi punti descrivono il codice/contratto locale: non attestano runtime, deploy o isolamento tra account.

## Interfaces And Protocols

I client usano Supabase JS e invocano `POST /functions/v1/domain` con azione e payload. Formati e risposte sono in [`docs/api-contract.md`](../../docs/api-contract.md).

## Dependencies And Relationships

La sessione si riferisce al giorno e alla versione scelta; le serie appartengono agli esercizi svolti e le note alle serie. La persistenza dipende da RLS e RPC Supabase; vedere [`docs/data-and-api-schema.md`](../../docs/data-and-api-schema.md).

## Procedures

Per aggiornare questa descrizione, confrontare le fonti elencate, contratto, Edge Function e schema dati. Non dichiarare verificati i flussi non eseguiti in un ambiente autorizzato.
