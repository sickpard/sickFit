# AGENTS.md — backend SickFit

## Decisioni e confini
- Backend: Supabase Edge Functions in TypeScript/Deno, collegate esclusivamente al progetto Supabase SickFit esistente.
- `supabase/` contiene configurazione e sorgenti locali delle funzioni. Non presumere che una funzione locale sia deployata o verificata.
- `domain` contiene il contratto locale condiviso per le operazioni di prodotto; `login-with-username` è un flusso pre-autenticato legacy, non l’API di dominio.
- Non introdurre un secondo database, identity provider o account utente.

## Sicurezza
- Per operazioni utente, validare l’identità della sessione e mantenere l’isolamento RLS. Non fidarsi di `user_id` forniti dal client.
- Non usare una service-role key come scorciatoia per operazioni utente. Qualunque eccezione amministrativa deve essere limitata, motivata e autorizzata.
- Segreti solo nell’ambiente server-side Supabase; mai in frontend, mobile, Git, log o documentazione.
- Prima di esporre funzioni: definire validazione, autorizzazione, rate limiting, CORS quando applicabile, logging privo di dati sensibili ed errori coerenti.
- Non modificare database, policy, grants, impostazioni Auth o deploy senza autorizzazione esplicita.

## Verifiche e documentazione
- Confrontare cambi a query o contratto con `../docs/data-and-api-schema.md`, `../docs/api-contract.md` e `../docs/architecture-decisions.md`.
- Su questa macchina sono ammesse solo verifiche statiche leggere; niente installazioni, test, build o runtime.
- Aggiornare README, decisioni e wiki quando cambia lo stato effettivo. Nessun commit o push senza richiesta esplicita.
