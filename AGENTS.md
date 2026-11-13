# SickFit — istruzioni per Hermes

## Scopo e vincoli
- PWA mobile-first in italiano per schede e diario allenamenti: Vue 3, TypeScript, Vite e Supabase Auth/Postgres. Online-only.
- Non introdurre SQLite, server residenti sulla VM, bot Telegram/Discord, funzionalità offline o sincronizzazione. App mobile nativa e scorciatoia per il workout del giorno sono backlog.
- Non chiedere né leggere segreti. Non committare `.env`, token o chiavi. Nel browser usare solo URL e publishable key; service-role key esclusivamente come segreto Supabase lato server.
- Nessun commit/push senza richiesta esplicita. Non modificare Supabase o distribuire funzioni senza autorizzazione.
- L’utente ha vietato build e comandi simili sulla VM; l’installazione era stata bloccata da heavyguard per memoria disponibile insufficiente. Non aggirare il blocco con altri strumenti o package manager. Nessuna build, test o deploy è stata verificata.

## Stato della base
- Prima iterazione di sorgenti, non release validata. `node_modules` e `package-lock.json` assenti. `npm install` è da eseguire in ambiente di sviluppo autorizzato; generare il lockfile con il package manager, non a mano.
- Il database Supabase `sickfit` (ref `blljepmetnvfriqjdpcn`) ha 10 tabelle e RLS attiva, con policy/grants e trigger confermati dall’utente. Gli strumenti Supabase disponibili a Hermes sono read-only. Non presumere che il codice locale o la Edge Function siano stati deployati.
- `supabase/functions/login-with-username` è solo sorgente locale. Prima del deploy rivedere rate limiting, CORS e segreti server-side.
- README e TODO distinguono sorgenti presenti da funzioni incomplete; non dichiarare una funzione pronta finché non è verificata.

## Modello dati e prodotto
- Isolamento per utente tramite RLS, non solo filtri UI.
- Schede multiple: `training_plans` → `plan_versions` → `plan_days` → `plan_exercises`; sessioni `workout_sessions` collegate alla versione e al giorno; esercizi svolti `workout_exercises`, serie `exercise_sets`, note multiple `set_notes`.
- Le modifiche alle schede devono creare una nuova versione e non alterare le sessioni storiche. Il numero di serie prescritto è indicativo; registrare serie in meno/in più e salti.
- Peso in kg, predefinito “per lato”, con scelta “totale”. Token Notion solo temporaneo durante l’import e mai conservato.

## Prossime attività
1. Configurare e installare dipendenze in un ambiente autorizzato; poi eseguire test e build solo con nuova autorizzazione.
2. Verificare signup/login a tre campi, RLS con account distinti, creazione schede/sessioni e storico.
3. Completare sicurezza e deploy della Edge Function solo dopo approvazione.
4. Implementare versionamento/modifica delle schede, recupero password e import JSON/Notion con validazione e anteprima.
5. Verificare e distribuire la PWA su hosting HTTPS.

Leggere anche `README.md` e la sezione SickFit in `~/TODO/TODO.txt` (sull’ambiente originario); aggiornare la documentazione pertinente dopo ogni modifica.