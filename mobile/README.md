# SickFit mobile

Client nativo Expo/React Native TypeScript per Android e iOS. Schermate italiane per accesso (username + email + password), registrazione e recupero, schede versionate, allenamenti con serie/alternative/salti, storico e impostazioni. Nessuna WebView, database locale, cache persistente dei dati di dominio o modalità offline.

## Contratto richiesto

L’app usa lo stesso progetto Supabase del web. Solo Auth (`signInWithPassword`, `signUp`, recupero e lettura del proprio `profiles.username` sotto RLS) accede direttamente a Supabase; i dati di dominio passano esclusivamente tramite `POST /functions/v1/domain`, body `{action,payload}`, risposta `{data}` oppure `{error:{code,message}}`. Invia la publishable key in `apikey` e il JWT della sessione nell’header `Authorization` con schema Bearer. Le azioni/DTO attese sono tipizzate in `src/lib/domain.ts`. Il backend contiene sorgenti locali per `domain`, ma non risulta deployato né verificato live: senza endpoint e RPC attivi le schermate di dominio non funzionano.

## Configurazione e verifica futura

- In un ambiente **autorizzato**, impostare `EXPO_PUBLIC_SUPABASE_URL` (HTTPS) e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dello **stesso** progetto del web. Le variabili `EXPO_PUBLIC_` sono pubbliche nel bundle: non inserirvi service-role key o segreti. Non sono forniti valori in repository.
- Autorizzare `sickfit://auth/callback` (e i redirect con `?flow=confirm` / `?flow=recovery`) nella allowlist Redirect URLs di Supabase Auth; il progetto Expo dichiara lo schema `sickfit`. Verificare su dispositivi iOS e Android reali/dev build; un link di email può aprire un browser senza che Expo Go gestisca lo schema custom.
- `expo-secure-store` conserva sessione e verifier PKCE; l’app non usa biometria. L’archivio sicuro su iOS può sopravvivere alla reinstallazione. Il logout elimina la sessione locale. I draft degli allenamenti esistono solo in memoria: se l’app si chiude, il draft non si recupera; la sessione vuota può essere ripresa se la sua versione è ancora disponibile, altrimenti può essere annullata.
- Dipendenze e versioni sono dichiarate ma **non installate**; nessun lockfile generato. Non sono stati eseguiti test, typecheck, build o runtime in questo checkout. Prima della distribuzione: installare e bloccare le dipendenze, definire gli identificatori nativi bundle/package, validare contratti e RLS live, conferma email, recupero, rinnovo JWT, start/complete/cancel, gestione rete e layout/accessibilità su entrambe le piattaforme. Nessun deploy o modifica remota eseguiti.

Vincoli operativi: `AGENTS.md` e le decisioni in `../docs/architecture-decisions.md`.
