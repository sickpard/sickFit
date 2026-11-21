# TODO — SickFit

**Aggiornato:** 21 novembre 2026. L’utente ha eseguito `docs/sickfit-domain.sql` nel progetto Supabase SickFit. Un successivo readback catalogo in sola lettura ha confermato cinque RPC `SECURITY INVOKER`, RLS/policy owner-scoped sulle nove tabelle di dominio, privilegi effettivi richiesti, colonne/constraint/FK e trigger `updated_at`. **RICONTROLLO ATTENTO OBBLIGATORIO:** verificare componente per componente cosa è stato effettivamente completato e cosa no; la presenza dei sorgenti o delle funzioni non prova comportamento runtime, isolamento o integrazione. Nessuna RPC è stata invocata e l’Edge Function non è stata distribuita; installazione, test, build e runtime restano non eseguiti.

## Implementato nel tree — DA RICONTROLLARE ATTENTAMENTE

- [ ] **Backend locale:** Edge Function `domain` con schede, sessioni e storico; validazione, risposte strutturate, JWT utente e client RLS per richiesta; `verify_jwt = true`. Le sessioni aperte restano visibili e l’avvio è serializzato per utente. Ricontrollare codice, CORS e RPC contro il database live.
- [ ] **SQL RPC applicato dall’utente:** `docs/sickfit-domain.sql` contiene cinque RPC transazionali `SECURITY INVOKER`; readback catalogo conferma oggetti e prerequisiti osservati. Non rilanciare alla cieca; ricontrollare diff/target e testare le RPC in ambiente isolato.
- [ ] **Contratto:** `docs/api-contract.md` e README Edge descrivono payload/DTO v1. Riconciliare contratto, Edge Function, RPC e client; API non live.
- [ ] **Frontend web:** dominio passa al client Edge; Auth resta Supabase diretto. Presenti verifica username, versionamento e archiviazione schede, sessioni incomplete, dettagli storico, verifica di salvataggi incerti e registrazione di ripetizioni/carico/durata/note. Ricontrollare flussi e accesso RLS a `profiles`.
- [ ] **Mobile:** schermate Expo per Auth, schede/editor, allenamento, storico/dettaglio e impostazioni; sessione Auth su SecureStore, deep link `sickfit` e registrazione di ripetizioni/carico/durata/note. Una sessione vuota può essere ripresa se la versione esatta è ancora disponibile; il draft non salvato resta solo in memoria e non si recupera dopo la chiusura. Verificare implementazione, navigazione, accessibilità, callback email e compatibilità iOS/Android.
**Confermato in questo working tree:** nessun `AGENTS.md` modificato; nessun commit, push o deploy eseguito.

## Da fare

### Backend/API

- [ ] Primo giro di revisione statica e correzioni eseguiti; ripetere la revisione indipendentemente prima del rilascio. Rate limiting/quote restano da definire e CORS da verificare nell’ambiente reale prima dell’esposizione.
- [ ] Rivedere la funzione locale `login-with-username` (rate limiting, CORS, gestione segreti e tentativi) prima di qualsiasi esposizione; non risulta deployata né verificata.
- [ ] Il primo tentativo di introspezione del 21 novembre 2026 è fallito; un successivo readback in sola lettura ha verificato schema/colonne, constraint/FK, policy owner-scoped, privilegi effettivi e trigger. Il trigger Auth crea `profiles` dal metadata `username`; restano da verificare policy/grants del profilo, redirect `Site URL`/allowlist, consegna email SMTP e isolamento con account distinti.
- [ ] Il readback ha confermato i privilegi effettivi `UPDATE training_plans` e `DELETE workout_sessions`; testare archive/cancel via RPC. Gli esempi commentati nello SQL non sono stati eseguiti.
- [ ] SQL già applicato dall’utente; non ridistribuire/rilanciare alla cieca. Dopo test/review autorizzati, distribuire `domain` e leggere il target aggiornato per verifica.

### Mobile

- [ ] Installare dipendenze e generare lockfile in ambiente autorizzato; verificare redirect `sickfit://auth/callback` e identificatori bundle/package.
- [ ] Verificare l’app su dispositivi/simulatori autorizzati prima di qualsiasi distribuzione.

### Rilascio e verifica

- [ ] Definire ambienti isolati, CI/deploy separati per componente, monitoraggio e procedura di rollback.
- [ ] In ambiente autorizzato, eseguire typecheck/test/build separatamente, poi test integrazione con due account (Auth, RLS cross-account, CRUD/versioni, workout, sessioni incomplete, storico, rete/timeout/doppio invio). Questi controlli non sono stati eseguiti.
- [ ] Riconciliare README, `SCHEMA.md`, decisioni e wiki con i sorgenti e lo stato reale; il presente aggiornamento documentale deve essere ricontrollato prima di considerarlo definitivo.
- [ ] Dopo i ricontrolli aggiornare questo TODO distinguendo le verifiche riuscite da quelle ancora aperte.

## Vincoli

- Non creare o migrare utenti/database; Supabase resta l’unico provider concordato.
- Nessun segreto in client/docs; nessuna modifica database/policy/Auth, deploy, commit o push senza autorizzazione esplicita e verifica del target.
- Il TODO registra la presenza di sorgenti locali e non certifica runtime, sicurezza completa o servizi remoti operativi.
