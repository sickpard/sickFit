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
---

## Short Description

Questa area descrive i flussi SickFit per definire schede di allenamento, registrare sessioni e consultare lo storico.

## Description

Il prodotto web è una PWA mobile-first in italiano. Le schede comprendono giorni ed esercizi; il flusso di sessione registra esercizi, serie e note. Il numero di serie prescritto è indicativo e le sessioni storiche devono restare associate alla versione di scheda scelta. La pagina [Schede, sessioni e storico](training-workflows.md) dettaglia quanto documentato nel repository.

## Functional Characteristics

- Manages schede, giorni, esercizi e alternative secondo i flussi presenti nel frontend.
- Stores sessioni, esercizi svolti, serie e note nel modello Supabase descritto nel [contratto dati/API](../../docs/data-and-api-schema.md).
- Shows lo storico delle sessioni e un tema chiaro/scuro con preferenza locale.
- Validates i file d’importazione JSON prima di consentire il salvataggio; l’import Notion non è implementato.

## Interfaces And Protocols

L’interfaccia di prodotto è la PWA Vue. Il frontend interagisce con Supabase Auth e Data API; i dettagli delle richieste sono nel contratto dati/API. Nessuna funzione offline è documentata come implementata.

## Dependencies And Relationships

Questa area dipende dal frontend Vue e dal progetto Supabase. Le sessioni fanno riferimento alla versione di scheda originaria; i vincoli di database e le lacune note sono descritti nel [contratto dati/API](../../docs/data-and-api-schema.md).

## Procedures

Per le procedure utente dettagliate, usare il manuale soltanto dopo aver verificato i flussi nella versione target. Lo [schema editoriale del manuale](../user-manual-schema.md) mantiene placeholder e non sostituisce una verifica runtime.
