# SickFit — schema della documentazione

**Ambito:** regole editoriali per la wiki tecnica e funzionale SickFit in `wiki/`. Questo documento non descrive database, API o conformità normativa.

**Fonti distinte:** il contratto dati/API è [`docs/data-and-api-schema.md`](docs/data-and-api-schema.md); gli schemi dei componenti sono in `docs/components/`; la proposta editoriale del manuale utente è [`wiki/user-manual-schema.md`](wiki/user-manual-schema.md).

## Lingua e accuratezza

- Scrivere in italiano, coerentemente con l’interfaccia; mantenere in inglese soltanto i nomi canonici delle sezioni richieste sotto.
- Conservare esattamente identificatori, percorsi, chiavi di configurazione, nomi API e label UI presenti nel codice.
- Distinguere implementato, pianificato, configurato ma non verificato, requisito e proposta. La presenza di sorgenti non prova deploy o comportamento runtime.
- Usare placeholder espliciti per dati ignoti. Non inventare versioni, contatti, autori, approvazioni, policy o claim di conformità.

## Autorità e struttura

- `AGENTS.md`: istruzioni operative e confini del monorepo.
- `SCHEMA.md`: regole editoriali normative per la wiki.
- `wiki/index.md`: mappa dei contenuti pubblicati.
- `wiki/overview.md`: perimetro del monorepo e collegamenti alle aree.
- `wiki/<area>/overview.md`: perimetro dell’area e link a tutte le sue sezioni.
- `wiki/<area>/<section>.md`: comportamento e contratti verificati di un argomento.
- I documenti collegati esterni alla wiki, inclusi `docs/data-and-api-schema.md`, `docs/components/*/SCHEMA.md`, README e TODO, restano nella loro posizione canonica e non vanno duplicati.

Ogni directory di area contiene un solo `overview.md`; ogni pagina-sezione appartiene a una sola area. L’indice collega overview, aree e sezioni pubblicate, questo schema e i documenti esterni collegati. Usare link relativi verificati e nomi Markdown in minuscolo.

## Frontmatter e sezioni

Ogni overview e pagina-sezione include YAML frontmatter con `title`, `status`, `role` e `source.references`. Le fonti devono puntare a file esistenti; usare soltanto riferimenti necessari e verificati.

Le pagine di overview e sezione seguono questa struttura, con contenuto in italiano:

1. `Short Description`
2. `Description`
3. `Functional Characteristics`
4. `Interfaces And Protocols`
5. `Dependencies And Relationships`
6. `Procedures` — solo quando esistono procedure documentabili

Non creare sezioni vuote solo per riempire il modello; se una categoria è richiesta dalla pagina, dichiarare in modo esplicito che non è definita o non è verificata.

## Aggiornamento e verifica

Prima di aggiornare una pagina, leggere fonti e istruzioni pertinenti. Aggiornare nella stessa attività l’indice, i link e lo stato TODO quando cambia un’attività aperta. Verificare che ogni pagina stabile sia raggiungibile dall’indice e che tutti i link relativi puntino a file presenti.

Una revisione statica non attesta accettazione UI, integrazione live, sicurezza completa, build o deploy. Riportare con precisione i controlli eseguiti e quelli non eseguiti.
