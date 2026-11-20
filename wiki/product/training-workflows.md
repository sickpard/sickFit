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
      path: frontend/src/lib/theme.ts
---

## Short Description

Questa sezione descrive i flussi del frontend SickFit per la programmazione degli allenamenti, la registrazione delle sessioni e la consultazione dello storico.

## Description

Una scheda raggruppa giorni ed esercizi e può includere alternative e note di prescrizione. Quando il contenuto della scheda viene modificato, il progetto documenta la creazione di una nuova versione per preservare i riferimenti delle sessioni precedenti. Durante una sessione si registrano gli esercizi svolti o saltati, le serie effettive, carichi, ripetizioni, durata e note. Le regole dettagliate di persistenza sono nel [contratto dati/API](../../docs/data-and-api-schema.md).

## Functional Characteristics

- Manages schede, giorni, esercizi e alternative, distinguendo i contenuti pianificati dalle sessioni registrate.
- Stores la sessione e i relativi dettagli nel database attraverso il client Supabase.
- Shows lo storico delle sessioni recenti.
- Validates l’import JSON e ne mostra un’anteprima modificabile prima del salvataggio; il limite applicativo del file è documentato come 1 MB.
- Configures il tema chiaro/scuro con preferenza salvata localmente sul dispositivo.
- Does not provide importazione Notion o salvataggio offline.

Queste caratteristiche riflettono il codice e i documenti locali; autenticazione, persistenza e policy Supabase live non sono verificate da questa pagina.

## Interfaces And Protocols

Il frontend usa Supabase JS per Auth e Data API. Le operazioni della sessione sono richieste separate dal browser e non sono descritte come una singola transazione atomica. Il formato d’import JSON è riportato nel [README](../../README.md).

## Dependencies And Relationships

La sessione è collegata al giorno e alla versione della scheda selezionata. Le serie appartengono agli esercizi svolti e le note alle serie. Il tema è una preferenza locale, non un dato di allenamento remoto.

## Procedures

Per aggiornare questo contratto, verificare `frontend/src/App.vue`, `frontend/src/lib/workout.ts`, il client Supabase e `docs/data-and-api-schema.md`. Non eseguire test, build o runtime sulla VM; dichiarare tali verifiche non eseguite.
