# SickFit

Monorepo per la PWA web SickFit, i servizi Supabase e uno scaffold mobile nativo.

## Componenti

- `frontend/` — PWA Vue 3 + TypeScript + Vite, mobile-first e online-only; usa Supabase Auth e Data API.
- `backend/supabase/` — configurazione e sorgente locale di `login-with-username`; il deploy non è verificato.
- `mobile/` — scaffold iniziale Expo/React Native con schermata segnaposto; auth e funzioni prodotto non sono implementate.
- `docs/` — decisioni, TODO, schema dati/API e schemi dei componenti.
- `wiki/` — panoramica e documentazione funzionale/tecnica.

## Stato e limiti

Il frontend documenta schede, giorni, esercizi, alternative, sessioni, serie, note, storico, import JSON e tema chiaro/scuro. L’import Notion non è implementato. La PWA non offre uso offline o sincronizzazione; non risulta un service worker. I flussi Supabase live, la Edge Function e il client mobile vanno distinti dal codice locale e non sono verificati da questo README.

In questa VM sono consentite solo verifiche statiche leggere: non eseguire installazioni, test, build o server di sviluppo. Seguire `AGENTS.md` e non aggirare controlli ambientali.

## Documentazione

- [Istruzioni operative](./AGENTS.md)
- [Schema della documentazione wiki](./SCHEMA.md)
- [Indice wiki](./wiki/index.md) e [panoramica](./wiki/overview.md)
- [Contratto dati e API](./docs/data-and-api-schema.md)
- [Decisioni architetturali](./docs/architecture-decisions.md) e [TODO](./docs/todo.md)
- Schemi dei componenti: [frontend](./docs/components/frontend/SCHEMA.md), [backend](./docs/components/backend/SCHEMA.md), [mobile](./docs/components/mobile/SCHEMA.md)
- [Schema editoriale del manuale utente](./wiki/user-manual-schema.md)

Il documento alla root `SCHEMA.md` riguarda la wiki e non sostituisce il contratto dati/API.