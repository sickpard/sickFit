# SickFit — SCHEMA componente mobile

## Scopo e stato

SickFit ha due esperienze mobile distinte da non confondere:

1. La PWA Vue responsive in `frontend/`, che condivide UI e flussi con il browser desktop.
2. Uno scaffold iniziale nativo Expo/React Native in `mobile/`, ancora privo di funzioni prodotto.

`mobile/` contiene `App.tsx`, `index.ts`, `app.json`, `package.json`, `tsconfig.json`, `.gitignore`, README e istruzioni. Il pacchetto dichiara Expo `~58.0.0`, React `19.3.0`, React Native `0.88.0` e TypeScript `~6.0.3`; non è presente lockfile e le dipendenze non risultano installate in questo checkout.

## Struttura e bootstrap dello scaffold

- `index.ts` importa `registerRootComponent` da Expo e registra il componente `App`.
- `App.tsx` mostra una schermata segnaposto con marchio/nome SickFit, headline e messaggio che annuncia la fase successiva; include StatusBar e stili React Native. Non carica dati o autenticazione.
- `app.json` dichiara nome `SickFit`, slug `sickfit`, versione `0.1.0`, orientamento portrait e UI system-aware. Non definisce bundle/package ID o scheme/deep link.
- `package.json` dichiara scripts `start`, `android` e `ios`, senza dipendenze auth, API o stato applicativo oltre Expo/React Native.
- `tsconfig.json` estende la configurazione Expo e abilita `strict`; `.gitignore` esclude output Expo e dipendenze.

Lo scaffold non è stato installato, avviato, compilato o provato su dispositivi per questa documentazione. Non dichiararlo eseguibile in base alla sola presenza del manifest.

## Architettura mobile prevista

Obiettivo concordato: app nativa Android/iOS con Expo/React Native, non WebView. Dovrà usare l’identità Supabase SickFit già esistente e le API/Edge Functions di dominio che saranno progettate; allo stato attuale tali API condivise non esistono. Il flusso dati corrente della web app, descritto nello [schema frontend](../frontend/SCHEMA.md), resta diretto verso Supabase.

Il target è online-only. L’app non deve contenere service-role key, credenziali DB o copie di dati personali non progettate. Prima di autenticare o inviare dati definire e verificare callback/deep link Supabase, storage sicuro della sessione, autorizzazione e contratto condiviso con il backend.

## Non implementato e decisioni aperte

- Signup/login Supabase nell’app, refresh/logout e recupero password.
- Navigazione, viste schede/sessioni/storico, componenti UI e collegamento API.
- Bundle/package ID, scheme, redirect/deep link e strategia release.
- Lockfile, test, build native, distribuzione o verifica su device.
- API applicativa condivisa che sostituisca l’accesso diretto web a Supabase.

Per le decisioni correnti vedere `../../../README.md` e `../../architecture-decisions.md`; per Auth, Data API e la funzione username, vedere lo [schema backend](../backend/SCHEMA.md).
