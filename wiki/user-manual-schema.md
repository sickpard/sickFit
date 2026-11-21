# SickFit — schema editoriale del manuale utente

**Scopo:** modello per redigere in futuro il manuale utente di SickFit. Non è il modello del database: per tabelle, relazioni e contratti usare [`../docs/data-and-api-schema.md`](../docs/data-and-api-schema.md).

**Stato:** schema editoriale, non manuale pubblicabile. Le funzionalità elencate sono aree da documentare, non prova che ogni flusso sia stato verificato. Non attesta conformità a standard.

## Regole editoriali

- Manuale in italiano, coerente con le etichette effettive dell’interfaccia.
- Usare procedure solo dopo averle verificate nell’applicazione e, per autenticazione o dati remoti, nell’ambiente previsto.
- Segnalare informazioni mancanti con placeholder tra parentesi quadre. Non inventare versione, contatti, date, approvazioni, immagini o comportamenti.
- Screenshot solo se forniti o acquisiti in ambiente autorizzato, riferiti a una versione identificata e con testo alternativo descrittivo.
- Preferire titoli gerarchici, link descrittivi, istruzioni numerate e tabelle semplici. Il colore non deve essere l’unico mezzo per comunicare.
- Questo documento non afferma conformità normativa.

## Struttura proposta del manuale

### Frontespizio e informazioni iniziali

1. **Copertina:** `[NOME SOFTWARE]`, `MANUALE UTENTE`, `[VERSIONE SOFTWARE]` e logo ufficiale solo quando forniti e verificati.
2. **Indice:** generato e aggiornato con gli strumenti del formato finale.
3. **Informazioni documento:** `[ID DOCUMENTO]`, `[NOME SOFTWARE]`, `[VERSIONE]`; cronologia compilata solo con dati approvati.
4. **Glossario:** acronimi e termini presenti realmente nell’app.

### Contenuto principale

1. Introduzione: scopo, utenti previsti e ambito; mantenere i punti ignoti come placeholder.
2. Panoramica software: sole funzioni confermate per la versione documentata.
3. Primo accesso e avvio: documentare signup, login, recupero password e conferma email solo dopo verifica dei flussi e configurazioni.
4. Interfaccia e navigazione: schermate e label esatte, con immagini verificate e alt text.
5. Moduli dell’interfaccia: descrizione, scopo, campi/limiti accertati e procedura numerata.
6. Risoluzione problemi: sintomo, controlli e rimedi riproducibili.
7. Supporto: `[CONTATTO]` e `[DISPONIBILITÀ]` finché non confermati.

## Informazioni da raccogliere prima della pubblicazione

- versione rilasciata e piattaforme/browser supportati;
- flussi UI, messaggi d’errore e configurazioni Auth;
- screenshot approvati e relativi testi alternativi;
- istruzioni di supporto e contatti autorizzati;
- cronologia modifiche verificata e proprietario della revisione.
