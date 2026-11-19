# SickFit mobile

Scaffold iniziale per l’app nativa multipiattaforma Expo/React Native con TypeScript. Include configurazione Expo, bootstrap e schermata segnaposto SickFit. Non include ancora autenticazione, navigazione, schermate funzionali o identificatori nativi Android/iOS.

L’app dovrà riutilizzare l’autenticazione Supabase e le API/backend SickFit concordate, senza WebView, database duplicati o credenziali DB sul dispositivo. Il flusso attuale web accede direttamente a Supabase: il contratto condiviso con il mobile va definito e verificato prima di implementare i flussi dati.

Le dipendenze sono dichiarate in `package.json`, ma non sono state installate e non è stato generato un lockfile. Il manifest usa Expo SDK 58, React 19.3.0 e React Native 0.88; la documentazione Expo indica Node.js 22.13.x come requisito minimo per SDK 58. Prima di sviluppo e release occorre installare e validare le dipendenze in un ambiente autorizzato. Gli identificatori bundle/package e i deep link di autenticazione restano da concordare. Per decisioni e vincoli vedere `../docs/architecture-decisions.md` e `AGENTS.md`.
