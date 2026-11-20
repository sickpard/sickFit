# AGENTS.md — frontend SickFit

## Ambito e stato
- Prima di modificare il frontend leggi [`SCHEMA.md`](../docs/components/frontend/SCHEMA.md), `../AGENTS.md` e `README.md`.
- Questa directory contiene la PWA esistente Vue 3 + TypeScript + Vite e il relativo manifest/lockfile.
- Il frontend usa attualmente Supabase Auth e PostgREST direttamente; l’API condivisa con l’app mobile non è ancora implementata.
- Vite carica gli env dalla root del monorepo tramite `envDir: '..'`. `.env.local` è ignorato: non leggerlo, stamparlo o copiarlo.

## Regole
- Mantieni UI e messaggi in italiano; preserva componenti, contratti Supabase e associazione delle sessioni alla versione originaria della scheda.
- Non inserire service-role key o altri segreti nel bundle client.
- Non migrare query dal client alle Edge Functions finché endpoint, autenticazione e rollout non sono definiti e autorizzati.
- Confronta modifiche a persistenza o autenticazione con `../SCHEMA.md`, `../docs/architecture-decisions.md` e `../docs/todo.md`.
- Su questo checkout sono consentite solo verifiche statiche leggere; niente installazioni, test, build o runtime.
- Aggiorna documentazione e wiki quando cambia lo stato; nessun commit o push senza richiesta esplicita.
