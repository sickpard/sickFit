# AGENTS.md — mobile SickFit

## Decisioni
- Tecnologia scelta: Expo/React Native con TypeScript, per Android e iOS.
- Deve essere una vera app nativa, non un wrapper WebView.
- Usare gli stessi account Supabase Auth, backend e dati SickFit; non duplicare identità o database.
- La PWA web non è un insieme di schermate React Native riutilizzabili. Condividere contratti o logica pura solo quando il riuso è concreto.

## Prodotto e sicurezza
- Progettare prima l’esperienza smartphone, accessibilità e movimento ridotto.
- Non aggiungere biometria, push, cache persistente o modalità offline senza una decisione di prodotto e una progettazione di sicurezza.
- Non salvare credenziali o dati sensibili in chiaro. Non collegare l’app direttamente al database con credenziali privilegiate.

## Operatività
- Questa directory contiene schermate Expo/React Native per i flussi principali; le dipendenze mobile non risultano installate e il lockfile, la build e il runtime non sono verificati in questo checkout.
- Per rispettare i vincoli del checkout, non installare toolchain o dipendenze, generare build native o avviare runtime sulla VM.
- Verificare Auth, rinnovo sessione e deep link su entrambe le piattaforme in un ambiente autorizzato prima del rilascio.
- Dopo l’autorizzazione e in un ambiente di sviluppo idoneo, generare/aggiornare lockfile e verificare il progetto; fino ad allora non dichiarare build o runtime funzionanti.
- Nessuna pubblicazione sugli store, commit o push senza richiesta esplicita.
