# SickFit backend

Supabase Edge Functions TypeScript/Deno sul progetto esistente. Il tree contiene `login-with-username` (legacy, pre-auth) e `domain` (API applicativa v1 proposta). Entrambe sono solo sorgenti locali.

## Stato

`domain` espone nel codice le azioni descritte in [`../docs/api-contract.md`](../docs/api-contract.md). Frontend e mobile invocano il contratto locale; Auth resta diretto a Supabase. Il 21 novembre 2026 l’utente ha applicato `../docs/sickfit-domain.sql` al progetto SickFit; un readback catalogo ha confermato funzioni, RLS/policy e privilegi effettivi. Le RPC non sono state invocate e l’Edge Function non è distribuita. Non sono stati eseguiti installazione, test, build o runtime; i controlli aperti sono nel TODO.

Non sono presenti qui nuove dipendenze o un runtime Node separato. Non leggere né inserire credenziali; i segreti devono restare nell’ambiente server-side Supabase.

## Prerequisiti prima di un deploy

Confrontare DDL live, RLS `USING`/`WITH CHECK`, grants e trigger; testare RPC in un ambiente isolato e con account distinti. Verificare CORS, limiti richieste/rate limiting, Auth redirect URLs, gestione errori e rollback. La funzione usa `SECURITY INVOKER`/JWT utente e dipende dai privilegi RLS effettivi; non usare la service-role key come credenziale generale.

Vedere `../docs/architecture-decisions.md`, `../SCHEMA.md` e `../AGENTS.md`.
