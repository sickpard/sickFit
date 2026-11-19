# Handoff: backend delle nuove repo SickFit e SickTracker

## Scopo

Preparare il lavoro da riprendere sul SickPC: collegare le nuove repository di SickFit e SickTracker ai rispettivi backend/provider. Hermes sul SickPC deve partire da repository appena clonate, non presumere che i checkout presenti su questa VM siano aggiornati o allineati. Questo documento è un piano di lavoro e un handoff: **non attesta** lo stato live corrente di GitHub, Supabase, Clerk o Neon e non autorizza modifiche remote.

## Percorsi e disposizione

I progetti nuovi devono essere directory sorelle dei rispettivi progetti esistenti, non sottodirectory e non sostituzioni:

- SickFit esistente: `/home/ubuntu/projects/personal/sickfit`; nuovo clone da collocare come sua directory sorella.
- SickTracker esistente: `/home/ubuntu/projects/personal/sicktracker`; nuovo clone da collocare come sua directory sorella.
- Sul SickPC la base è la directory che contiene i checkout locali correnti: individuare il percorso reale con `pwd`/`realpath` e ricavare la directory sorella da lì. Non copiare alla lettera `/home/ubuntu`, che è il percorso della VM.

I nomi esatti delle nuove repo GitHub e i relativi URL non sono specificati in questo handoff. Prima di clonare, individuarli tramite `gh repo list sickpard` (senza mostrare segreti) e/o chiedere all’utente se l’identificazione non è univoca. Non assumere che siano `sickfit-new`, `sicktracker-new` o che i vecchi repository siano stati rinominati. Verificare proprietario, nome, visibilità, branch predefinito e URL. Clonare le repo corrette nelle directory sorelle concordate; mai clonare sopra, rinominare, cancellare o sovrascrivere i checkout esistenti. Se la directory di destinazione esiste già, fermarsi e ispezionarla prima di qualsiasi azione.

## Inventario noto (storico, da riconfermare)

### SickFit esistente

- Checkout registrato: `/home/ubuntu/projects/personal/sickfit`, branch `master`, remote `git@github.com:sickpard/sickFit.git`.
- Progetto documentato come PWA Vue 3 + TypeScript + Vite, Supabase Auth/Postgres e RLS.
- Le istruzioni locali vietano sulla VM installazioni, test, build e avvio; consentono solo verifiche statiche. Il checkout osservato aveva modifiche staged, non staged e file non tracciati: preservarle e non usarlo come sorgente da sovrascrivere.
- Documentazione locale `AGENTS.md` richiede di leggere `SCHEMA.md`, README e wiki; prima di operare usare sempre il contenuto delle nuove repo come autorità per lo stato aggiornato.
- Il codice Edge Function `login-with-username` esisteva localmente, ma deploy e comportamento live non erano verificati. Mancavano verifiche live delle policy/RLS e del flusso account.

### SickTracker esistente

- Checkout registrato: `/home/ubuntu/projects/personal/sicktracker`, branch `main`, remote HTTPS `https://github.com/sickpard/sicktracker.git`.
- Monorepo noto: frontend Vue 3/TypeScript/Vite/PWA; backend Express 5 + TypeScript su Vercel Functions scelto ma non implementato nello snapshot documentale; mobile Expo/React Native pianificato. L’architettura può essere cambiata nelle nuove repo: non applicare automaticamente le scelte precedenti.
- Database Neon e app Clerk esistenti vanno mantenuti se le istruzioni e lo stato live aggiornati confermano che sono quelli da collegare. Non creare utenti/dati o progetti duplicati senza decisione dell’utente.
- Il precedente handoff documentava un Neon project `neon-blue-queen` (ID `curly-hall-98081760`), branch `main`, database `neondb`, provider JWT Clerk sulla Neon Data API e schema dichiarato applicato. Queste informazioni erano riportate nei docs ma non riverificate live. Le query read-only preparate allora non erano ancora state eseguite. Non rieseguire SQL iniziale, non migrare dati e non disabilitare Neon Auth basandosi soltanto su questo testo.

Tutti i punti sopra sono indizi per la discovery, non stato garantito nel momento dell’incarico. Prima di ogni azione esterna, Hermes deve verificare la documentazione e lo stato attuale con i soli accessi autorizzati.

## Principi non negoziabili

1. Lavorare sulle nuove repo clonate e sui nuovi branch previsti. Non modificare i vecchi checkout per comodità; non copiare codice o documentazione tra repo senza aver confrontato contenuti, licenze/ownership e stato Git.
2. Prima di ogni checkout o modifica: leggere `~/wiki/README.md`, `~/GUIDE/README.md`, questa pagina e la guida pertinente; nella nuova repo leggere `AGENTS.md`, README, docs, TODO, configurazione e codice interessato.
3. Controllare `git status --short --branch`, branch, remote e `git log -1` in entrambe le vecchie e nuove repo. Non fare reset, clean, checkout distruttivi, merge/rebase o push senza autorizzazione specifica.
4. Non leggere, stampare, copiare, incollare in chat o salvare in documenti `.env*`, token, password, secret key, connection string, chiavi private o codici MFA. È consentito controllare i nomi delle variabili in `.env.example` senza valori sensibili. Usare dashboard/strumenti autenticati e vault, mai chiedere segreti in chat.
5. Distinguere lettura e scrittura. Ispezione, inventario e query SELECT non autorizzano DDL/DML, creazione o cancellazione risorse, cambi di policy/permessi, collegamento di GitHub, deploy o modifica di variabili provider.
6. Per ogni scrittura remota, identificare prima esattamente risorsa/ambiente/branch, impatto, reversibilità e backup. Chiedere conferma prima di operazioni distruttive o irreversibili. Dopo una scrittura autorizzata, leggere di nuovo lo stesso target e verificare l’esito.
7. Mai mettere credenziali DB o segreti Clerk/Supabase in codice client, repository, log, prompt, issue o wiki. Distinguere chiavi pubblicabili/anon destinate al client da chiavi segrete/service role riservate al server.
8. Procedere per fasi, in modo sequenziale e con una singola operazione remota alla volta; riportare risultati e chiedere decisioni quando l’esito cambia il passo successivo. Non fare build/install/test pesanti sul SickPC/VM senza autorizzazione valida per quel singolo ambiente e incarico.
9. Aggiornare la documentazione nella nuova repo (README/AGENTS/TODO/schema/provider setup e wiki, secondo la struttura reale) dopo ogni cambiamento effettivo. Aggiornare anche la wiki centrale e il TODO centrale se cambia lo stato. Registrare data, fuso orario, ambito e prove; separare stato verificato, dato storico e ignoto.
10. Nessun commit/push/deploy non richiesto. A fine lavoro versionabile chiedere «Vuoi che pusha le modifiche?» se non già richiesto. Un sì vale solo per questo incarico.

## Sequenza operativa suggerita

### Fase 0 — discovery e prerequisiti

- Verificare host corrente (SickPC), utente, directory base e istruzioni locali senza esporre segreti.
- Individuare i nomi esatti delle due nuove repo sotto l’account `sickpard`, i branch e gli URL. Se `gh` non è autenticato o le repo non sono elencate con certezza, fermarsi e chiedere il dato necessario; non tentare credenziali alternative o URL inventati.
- Leggere i template di progetto richiesti dalla guida (`~/GUIDE/templates/AGENTS.md` e `~/GUIDE/templates/Project-User-Manual-Schema.md`) se si deve completare l’impostazione documentale delle nuove repository; ispezionare prima stack e contenuti, adattando i modelli ai fatti.
- Elencare directory destinazione previste come sorelle e verificare che non esistano oppure ispezionarle senza sovrascrivere.

### Fase 1 — clone e confronto

- Clonare una repo per volta nella directory sorella corretta; autenticazione GitHub con il metodo già configurato sul SickPC, senza inserire token negli URL.
- Verificare URL, proprietario, branch, commit HEAD e stato pulito del clone. Non fare push.
- Confrontare le istruzioni/README/lockfile e architettura delle repo nuove con la documentazione corrente dei progetti esistenti; annotare differenze e incompatibilità, senza trasferire automaticamente file.
- Creare/aggiornare documentazione di progetto solo dopo questa discovery. Identificare cosa è davvero richiesto per il collegamento backend e cosa è già presente.

### Fase 2 — definire la topologia per prodotto

Per ogni repo determinare e documentare con prove:

- quale frontend/backend/edge function esiste, framework/runtime, endpoint, deployment target e fonte di verità dello schema;
- provider di autenticazione realmente usato e modello identità/ID utente;
- accesso dati (client diretto, API applicativa, Edge Function), ambienti (dev/staging/prod) e confini dei segreti;
- mapping tra variabili richieste e provider, senza valori; dove configurarle e per quali ambienti;
- schema e migrazioni esistenti, stato migration tracking, policy/grants/RLS o controlli server-side; non assumere che “RLS attivo” significhi policy corrette;
- test di integrazione necessari e strategia rollback.

Non forzare un’identità architetturale tra SickFit e SickTracker: SickFit è documentato con Supabase, SickTracker con Clerk + Neon; verificare che le nuove repo confermino questa separazione. Non collegare Supabase a SickTracker o Neon a SickFit per analogia.

### Fase 3 — verifiche read-only provider

Operare un provider alla volta e annotare solo identificatori non segreti e risultati pertinenti:

**GitHub**
- Verificare account attivo, proprietario, repository, permessi, branch e collegamenti CI/deploy. Non cambiare visibility, branch protection, secrets/actions o integrazioni senza autorizzazione.

**Supabase (solo SickFit se confermato)**
- Identificare il progetto corretto tramite nome/ID verificati, non dal nome del codice soltanto.
- Ispezionare in sola lettura tabelle, colonne, migrazioni, funzioni, Auth settings, redirect URLs, grants e policy RLS. Distinguere database e Auth utenti; tabella applicativa vuota non significa assenza di utenti.
- Non rieseguire migration o SQL iniziale. Se esiste una baseline/schema diverso, documentare differenze e proporre migrazione separata.
- Verificare stato e configurazione della Edge Function `login-with-username` solo se presente/necessaria; non distribuirla senza revisione e autorizzazione esplicita.

**Clerk e Neon (solo SickTracker se confermato)**
- Verificare l’app Clerk corretta, issuer/JWKS, template JWT/claim, modalità accesso e redirect; non esporre secret key.
- Verificare progetto/branch/database Neon, tabelle, colonne, grants, RLS/policy e provider JWT Data API. Distinguere lo stato della Neon Data API da Neon Auth; non disabilitare o rimuovere Neon Auth.
- Eseguire esclusivamente query read-only dopo averne verificato il testo e il target. Salvare le query in docs solo se contengono esclusivamente SELECT/catalog inspection e non credenziali.
- Una discrepanza tra docs e live richiede di fermarsi prima di cambiare schema o auth; aggiornare prima l’inventario e proporre il piano.

### Fase 4 — piano di implementazione

- Proporre un ordine minimo, reversibile e specifico per ciascun progetto; indicare file, endpoint, env var names, provider dashboard, dipendenze e criteri di completamento.
- Mantenere temporaneamente il flusso attuale se necessario per transizione; niente doppie scritture senza decisione esplicita e progettazione di riconciliazione.
- Per SickFit, identificare se il nuovo repo mantiene Supabase client-side con RLS oppure introduce un backend/Edge Function; non assumere che “collegamento backend” significhi migrare piattaforma.
- Per SickTracker, se confermato, mantenere Clerk come identity provider e Neon come database esistente. Implementare API server-side solo se la nuova repo e i requisiti lo confermano; la connection string resta server-side. Non sostituire la Data API prima di aver verificato il backend e definito cutover/rollback.
- Prima di scritture provider, mostrare piano, impatto, target e rollback e attendere autorizzazione esplicita.

### Fase 5 — implementazione e verifica

- Implementare un passaggio per volta e mantenere documentazione aggiornata.
- Verificare staticamente contratti/env names e diff; eseguire test/build solo nel SickPC se esplicitamente autorizzato e compatibile con le regole del luogo. Non effettuare test che scrivono dati di produzione.
- Prove d’integrazione con utenti/database di test distinti; verificare autorizzazione per identità utente, non solo login, e isolare i test dai dati reali.
- Dopo eventuali cambi provider, leggere di nuovo le configurazioni non segrete, verificare migrazioni e test end-to-end autorizzati. Non chiamare “completato” un collegamento sulla sola base della presenza di env var o di un deploy.

## Registro di handoff da compilare

Per ogni prodotto aggiungere una sezione con:

- repository/URL/branch/commit e percorso clone;
- timestamp e fuso per ogni verifica live;
- stato verificato per GitHub, Supabase oppure Clerk/Neon;
- schema e auth effettivamente trovati, con riferimenti ai file/query read-only;
- modifiche locali/remote effettuate e relativo read-back;
- controlli eseguiti/non eseguiti, limiti e decisioni ancora richieste;
- nessun valore segreto: solo nomi delle variabili e posizione di configurazione.

## Prompt pronto per Hermes sul SickPC

```text
Devo riprendere il collegamento backend dei NUOVI progetti SickFit e SickTracker alle rispettive repository e ai provider già previsti. Prima leggi integralmente ~/wiki/README.md, ~/GUIDE/README.md, la guida operativa pertinente e il documento handoff `collegamento-backend-sickfit-sicktracker.md` nella wiki locale/di progetto dove è stato salvato. Poi applica le istruzioni AGENTS.md delle nuove repository.

Contesto: i nuovi cloni devono essere directory SORELLE dei checkout attuali sickfit e sicktracker, non sottocartelle e non sostituzioni. Sul SickPC individua il percorso reale della directory che contiene i checkout e usa quello. I nomi/URL esatti delle nuove repository non sono presunti: verifica GitHub sotto sickpard e chiedimi chiarimento se non sono univoci. Non indovinare nomi o URL. Prima verifica che le directory destinazione non esistano; se esistono, fermati e ispezionale senza sovrascrivere. Clona una repository per volta, verifica remote/branch/HEAD/status e non fare commit o push.

Questo incarico comprende discovery, clone, documentazione accurata e preparazione/collegamento backend, ma NON concede automaticamente autorizzazione a scrivere su GitHub, Supabase, Clerk, Neon, Vercel o database. Procedi sequenzialmente: una singola operazione remota per volta. Inizia con controlli read-only e riferisci risultati concreti, poi chiedimi conferma prima di ogni modifica remota o distruttiva. Dopo ogni scrittura autorizzata fai read-back sul target esatto.

Per ogni nuova repo leggi AGENTS.md, README, docs, TODO, schema, package/lock/config e sorgenti pertinenti; confronta con lo stato documentato del vecchio SickFit e SickTracker senza copiarne automaticamente codice o assumere che le decisioni siano ancora valide. Verifica separatamente che SickFit usi davvero Supabase e SickTracker davvero Clerk + Neon. Non incrociare i provider per analogia. I vecchi dati sulla configurazione Supabase/Clerk/Neon sono storici e non verificati live.

Non leggere, stampare, chiedere in chat o salvare `.env*`, token, password, secret key, connection string, chiavi private o MFA. Non inserire segreti in codice client o documentazione. È consentito verificare nomi variabili/placeholder in `.env.example` senza valori. Non eseguire DDL/DML, migration, deploy, cambi policy/grants, disattivazione Neon Auth, creazione/cancellazione di risorse o modifiche di permessi senza mia approvazione esplicita dopo avermi mostrato target, impatto e rollback. Le query database iniziali devono essere solo SELECT/catalog inspection e sul progetto verificato.

Dopo ogni modifica documentale/di codice/config aggiorna la documentazione della nuova repo, la sua wiki/indici pertinenti e la wiki centrale/TODO secondo le istruzioni. Riporta fatti verificati, dati storici e ignoti in categorie distinte, con timestamp/fuso e prove. Non eseguire build/install/test pesanti senza autorizzazione valida per il SickPC; verifica soltanto quanto consentito e dichiara i controlli non eseguiti.

Inizia ora soltanto con la fase 0: identifica host e percorso base, leggi le istruzioni, controlla stato/branch/remotes delle repo esistenti senza leggere segreti e individua le nuove repo GitHub senza modificarle. Poi comunicami nomi/URL/branch verificati, percorsi sorelle proposti, prerequisiti mancanti e piano del clone; se tutto è univoco e le directory non esistono, puoi procedere ai cloni read-only uno alla volta. Non modificare ancora provider o database.
```
