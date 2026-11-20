# SickFit — schema editoriale del manuale utente

**Scopo:** modello per redigere in futuro il manuale utente di SickFit. È adattato da `~/GUIDE/templates/Project-User-Manual-Schema.md`; non è il modello del database. Per tabelle, relazioni e contratti dati usare invece [`../SCHEMA.md`](../SCHEMA.md).

**Stato:** schema editoriale, non manuale pubblicabile. Le funzionalità elencate sono aree da documentare, non prova che ogni flusso sia stato verificato. Non attesta conformità a standard.

## Regole editoriali

- Manuale in italiano, coerente con le etichette effettive dell’interfaccia.
- Usare contenuti e procedure solo dopo averli verificati nell’applicazione e, per l’autenticazione o i dati remoti, nel relativo ambiente di test.
- Segnalare le informazioni mancanti con placeholder tra parentesi quadre. Non inventare versione, contatti, date, approvazioni, immagini o comportamenti.
- Ogni screenshot deve essere fornito o acquisito in ambiente autorizzato, riflettere una versione identificata e avere testo alternativo descrittivo. Nessuna immagine è attualmente approvata da questo schema.
- Preferire titoli gerarchici, link descrittivi, istruzioni numerate, tabelle semplici e testo leggibile. Il colore non deve essere l’unico mezzo per comunicare un’informazione.
- La guida generale della VM riporta sintesi pubbliche di alcuni standard, ma non il loro testo completo autorizzato né obblighi di clausola applicabili a SickFit. Questo documento non afferma conformità normativa.

## Struttura proposta del manuale

### Frontespizio e informazioni iniziali

1. **Copertina:** `[NOME SOFTWARE]`, `MANUALE UTENTE`, `[VERSIONE SOFTWARE]` e logo ufficiale, solo quando forniti e verificati. Non mostrare istruzioni placeholder o dati di approvazione inventati.
2. **Indice:** pagina/sezione dedicata, generata e aggiornata con gli strumenti del formato finale.
3. **Informazioni documento:** `[ID DOCUMENTO]`, `[NOME SOFTWARE]`, `[VERSIONE]`; cronologia `Versione | Data | Modifica`, compilata solo con dati approvati.
4. **Glossario:** acronimi e termini presenti realmente nell’app, senza definizioni non confermate.

### Contenuto principale

1. **Introduzione** — scopo, utenti previsti e ambito del manuale; mantenere i punti ignoti come placeholder.
2. **Panoramica software** — descrizione di SickFit e sole funzioni confermate per la versione documentata.
3. **Primo accesso e avvio** — requisiti, apertura dell’app e accesso; documentare signup, login, recupero password e conferma email solo dopo verifica del flusso reale e delle configurazioni richieste.
4. **Interfaccia e navigazione** — schermate, controlli e nomi esatti visibili; inserire immagini e alt text soltanto dopo verifica.
5. **Moduli dell’interfaccia** — ripetere per ogni schermata/funzione:
   - descrizione breve e scopo;
   - immagine verificata con testo alternativo;
   - tabella `Campo | Descrizione` con dati e limiti accertati;
   - procedura numerata con le etichette UI esatte.
6. **Risoluzione dei problemi** — sintomo, controlli e rimedi riproducibili, senza ipotizzare la causa di errori non diagnosticati.
7. **Supporto** — `[CONTATTO]` e `[DISPONIBILITÀ]` finché il proprietario non conferma i dati.

## Aree funzionali da valutare

La documentazione del progetto descrive schede di allenamento, giorni ed esercizi, registrazione delle sessioni e dello storico, selettore del tema, versionamento delle schede, recupero password e import JSON. Prima di scrivere istruzioni dettagliate verificare nella versione target ciascun flusso, i messaggi d’errore e i limiti. L’import Notion è documentato come non implementato; non includerlo come procedura disponibile.

## Impaginazione per eventuale esportazione

Il Markdown non fissa margini, font, intestazioni, piè di pagina o paginazione. Se si crea una versione DOCX/PDF, scegliere e documentare formato pagina, margini, stili semantici per titoli, numerazione, header/footer, sommario aggiornabile e testo minimo leggibile; controllare il file esportato nel visualizzatore previsto. Non dichiarare la validità di un pacchetto o la conformità di una pubblicazione senza test reali.

## Informazioni da raccogliere prima della pubblicazione

- versione rilasciata e piattaforme/browser supportati;
- flussi UI e testi esatti, inclusi autenticazione, errori e recupero account;
- screenshot approvati e relativi testi alternativi;
- istruzioni di supporto e contatti autorizzati;
- cronologia modifiche verificata e proprietario della revisione.
