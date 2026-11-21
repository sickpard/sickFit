# AGENTS.md — frontend SickFit

## Ambito e stato
- Questa directory contiene la PWA esistente Vue 3 + TypeScript + Vite e il relativo manifest/lockfile.
- Il frontend usa Supabase Auth direttamente; le operazioni di dominio passano dal client `src/lib/domain.ts` alla Edge Function locale `domain` secondo il contratto condiviso con mobile.
- Vite carica gli env dalla root del monorepo tramite `envDir: '..'`. `.env.local` è ignorato: non leggerlo, stamparlo o copiarlo.

## Regole
- Mantieni UI e messaggi in italiano; preserva componenti, contratti Supabase e associazione delle sessioni alla versione originaria della scheda.
- Non inserire service-role key o altri segreti nel bundle client.
- Non modificare il contratto condiviso o le integrazioni senza coordinare client, Edge Function e schema; il deploy non è attestato.
- Confronta modifiche a persistenza o autenticazione con `../docs/data-and-api-schema.md`, `../docs/api-contract.md`, `../docs/architecture-decisions.md` e `../docs/todo.md`.
- Su questo checkout sono consentite solo verifiche statiche leggere; niente installazioni, test, build o runtime.
- Aggiorna documentazione e wiki quando cambia lo stato; nessun commit o push senza richiesta esplicita.
