# TODO — SickFit

**Aggiornato:** 19 novembre 2026. Stato locale del monorepo; nessuna modifica remota o deploy effettuati.

## Completato in questa fase

- [x] Organizzata la repository esistente come monorepo senza submodule.
- [x] Spostata la PWA Vue in `frontend/`, mantenendo il package manifest e il lockfile del frontend; Vite legge gli env dalla root monorepo.
- [x] Spostate configurazione Supabase e sorgente della Edge Function esistente in `backend/supabase/`.
- [x] Confermate le direzioni: Supabase Edge Functions con TypeScript/Deno per il backend; Expo/React Native con TypeScript per Android/iOS.
- [x] Creato uno scaffold mobile minimo con manifest Expo, bootstrap TypeScript e schermata segnaposto.
- [x] Aggiornati README, SCHEMA, wiki e istruzioni operative per riflettere la nuova struttura.

## Da fare

### Backend/API

- [ ] Definire il catalogo delle operazioni di dominio e il contratto API versionato, inclusi schemi input/output ed errori; decidere se documentarlo con OpenAPI.
- [ ] Definire e verificare il flusso JWT Supabase e l’accesso per utente con RLS; non usare la service-role key come credenziale generale per operazioni utente.
- [ ] Progettare e implementare le Edge Functions di dominio, con validazione, autorizzazione, rate limiting, logging sicuro e gestione coerente degli errori.
- [ ] Rivedere la funzione locale `login-with-username` (rate limiting, CORS, gestione segreti e tentativi) prima di qualsiasi esposizione; non risulta deployata né verificata.
- [ ] Pianificare il passaggio graduale delle query del frontend all’API, senza doppie scritture e preservando lo storico delle versioni piano.

### Mobile

- [ ] Installare le dipendenze, generare il lockfile e verificare lo scaffold in un ambiente di sviluppo autorizzato; tali attività non sono state eseguite in questo checkout.
- [ ] Definire identificatori bundle/package e schema/deep link per Supabase Auth su iOS e Android.
- [ ] Implementare autenticazione, sessione sicura, navigazione e schermate funzionali contro lo stesso backend/dati.
- [ ] Verificare l’app su dispositivi/simulatori autorizzati prima di qualsiasi distribuzione.

### Rilascio e verifica

- [ ] Riconfermare in sola lettura lo stato live di Auth, RLS, grants e schema prima di migrazioni o cutover.
- [ ] Definire ambienti isolati, CI/deploy separati per componente, monitoraggio e procedura di rollback.
- [ ] Eseguire test e build dopo la riorganizzazione in un ambiente autorizzato; non sono stati eseguiti in questa fase.

## Vincoli

- Non creare o migrare utenti/database; Supabase resta l’unico provider concordato.
- Nessuna modifica DB, policy, Auth, deploy, commit o push senza autorizzazione esplicita.
- Il TODO registra lo stato locale e non certifica che funzioni, configurazioni o servizi remoti siano operativi.
