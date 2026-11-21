# Schema componente — App mobile nativa

## Stato

`mobile/` contiene un client Expo/React Native TypeScript con sorgenti per autenticazione, schede, editor, sessioni, storico e impostazioni. Dipendenze e lockfile mobile non risultano verificati; build e runtime non sono stati eseguiti in questo checkout.

## Architettura

App nativa Android/iOS, non WebView. Usa lo stesso progetto Supabase del web: Auth diretto e operazioni di dominio tramite Edge Function `domain`. La sessione Auth è conservata con SecureStore; i draft di allenamento restano in memoria e non sono recuperati dopo la chiusura.

## Interfacce

La configurazione dichiara lo schema deep link `sickfit`; gli URL di callback e l’allowlist Auth devono essere verificati su dispositivi iOS e Android. DTO e azioni sono condivisi nel contratto locale `docs/api-contract.md`.

## Limiti e verifiche

Nessun install, typecheck, test, build o runtime eseguito in questo checkout. Verificare callback email, rinnovo sessione, navigazione, accessibilità, identificatori bundle/package e comportamento su entrambe le piattaforme prima del rilascio.

Riferimenti: [`contratto API`](../../api-contract.md), [`schema dati/API`](../../data-and-api-schema.md), [`decisioni architetturali`](../../architecture-decisions.md).
