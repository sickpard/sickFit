# SickFit — schema della documentazione

**Ambito:** regole editoriali per la wiki tecnica e funzionale SickFit in `wiki/`. Questo documento non descrive database, API, manuale utente o conformità normativa.

**Fonti distinte:** il contratto dati/API è [`docs/data-and-api-schema.md`](docs/data-and-api-schema.md); gli schemi dei componenti sono in `docs/components/`; la proposta editoriale del manuale utente è [`wiki/user-manual-schema.md`](wiki/user-manual-schema.md). Non confondere queste responsabilità.

## Lingua e accuratezza

- La prosa della wiki è in italiano, coerente con la lingua dell’interfaccia. I titoli delle sezioni strutturali restano nella forma canonica inglese definita sotto.
- Conservare esattamente identificatori, percorsi, chiavi di configurazione, nomi API e label UI presenti nel codice.
- Distinguere implementato, pianificato, configurato ma non verificato, requisito e proposta. La presenza di sorgenti non prova un deploy o un comportamento runtime.
- Mantenere placeholder espliciti per dati ignoti. Non inventare versioni, contatti, autori, approvazioni, policy o claim di conformità.

## Autorità e struttura

- `AGENTS.md`: istruzioni operative e confini del monorepo.
- `SCHEMA.md`: queste regole normative per la wiki.
- `wiki/index.md`: mappa dei contenuti pubblicati.
- `wiki/overview.md`: semantica del monorepo e collegamenti alle aree.
- `wiki/<area>/overview.md`: perimetro di un’area; ogni sezione dell’area è collegata qui.
- `wiki/<area>/<section>.md`: comportamento e contratti verificati di un argomento.
- Documenti collegati esterni alla wiki, inclusi `docs/data-and-api-schema.md`, `docs/components/*/SCHEMA.md`, README e TODO, restano nella loro posizione canonica e sono collegati senza copiarne il contenuto.

Ogni directory di area contiene un solo `overview.md`; ogni pagina-sezione appartiene a una sola area. L’indice collega la panoramica, tutte le aree e sezioni pubblicate, lo schema alla root e i documenti esterni collegati. Link interni relativi, percorsi verificati; nomi dei nuovi Markdown in minuscolo.

## Frontmatter

Ogni overview e sezione contiene YAML frontmatter:

```yaml
---
title: "Titolo descrittivo"
status: active
role: functional_module
source:
  references:
    - part: component
      path: frontend/src/App.vue
---
```

`title`, `status` e `role` sono obbligatori. `status` è `active`, `draft`, `commercial` o `archived`. `role` è `application`, `functional_module`, `frontend`, `platform_service`, `config-data` o `status-data`. `navigation` è facoltativo e descrive solo la UI realmente esistente. `source.references` è facoltativo; se presente, contiene solo percorsi relativi reali e un `part` appropriato (`component`, `template`, `service`, `model`, `api`, `endpoint`, `repository`, `persistence`, `configuration`, `test` o `other`). Non inventare selector o file.

## Struttura dei contenuti

Overview e sezioni usano, nell’ordine indicato, i capitoli applicabili:

```markdown
## Short Description
## Description
## Functional Characteristics
## Interfaces And Protocols
## Dependencies And Relationships
## Procedures
## UI Fields
## Variables
```

`Description` è obbligatorio e definisce prima l’oggetto, poi ne spiega uso, contesto, limiti e relazioni. Le descrizioni sono concettuali e orientate all’utente; dettagli di implementazione e percorsi sorgente vanno nei riferimenti o nei capitoli tecnici pertinenti.

`Functional Characteristics` riporta solo comportamenti osservabili e verificati, distinguendo input, output, modifiche dati, errori e interventi umani. Usare verbi precisi: `Manages`, `Shows`, `Sends`, `Receives`, `Calculates`, `Exports`, `Stores`, `Notifies`, `Configures`, `Monitors`, `Validates`, `Transfers`, `Analyzes`, `Generates`, `Simulates`; non descrivere import Notion, API condivise mobile o uso offline come implementati.

`Interfaces And Protocols` descrive interazioni con UI, browser, Supabase o altri sistemi solo quando provate dalle sorgenti. Se non è definita alcuna interfaccia esterna, scrivere esattamente `No external interface or protocol is defined.` `Dependencies And Relationships` elenca dipendenze di dominio verificate; se non ve ne sono, scrivere `No dependencies.`

`Procedures` contiene flussi ordinati verificati, con prerequisiti, azioni, esito atteso e recupero solo se documentati. `UI Fields` si include per schermate con campi o dati identificabili e usa una tabella `Field | Description`; non elenca pulsanti o proprietà interne. `Variables` si include per strutture dati, con nomi e tipi esatti, significato, default e vincoli verificati; valori ignoti si marcano `Not verified`.

## Documenti speciali e aggiornamento

L’indice, i runbook, il TODO, gli handoff e la specifica del manuale possono usare strutture proprie; non sono sezioni dell’area salvo che l’indice li classifichi espressamente così. Il manuale utente segue `wiki/user-manual-schema.md`, non questo schema.

Prima di pubblicare una pagina: controllare i riferimenti nel codice/configurazione, link relativi, frontmatter, stato delle feature e distinzione tra fatto storico e stato corrente. Aggiornare overview e indice nello stesso incarico. Un controllo statico non prova build, runtime, sicurezza o deploy.