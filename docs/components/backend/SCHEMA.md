# Schema componente — Backend Supabase

## Stato

`backend/supabase/` contiene configurazione e sorgenti locali delle Edge Functions `domain` e `login-with-username`. Non è attestato il deploy né il runtime di nessuna funzione.

## Responsabilità

`domain` espone nel sorgente locale operazioni di schede, sessioni e storico. Richiede un JWT valido, associa le query all’identità autenticata e demanda le scritture composte a RPC `SECURITY INVOKER`. `login-with-username` è una funzione legacy separata; il flusso client corrente usa Auth diretto.

## Sicurezza e dipendenze

Il modello previsto usa publishable key e JWT dell’utente, con isolamento delegato a RLS. Non inserire `service_role` nel client. Configurazione locale e sorgente non provano correttezza runtime, CORS, limiti anti-abuso o isolamento effettivo.

## Verifiche

Lo script `docs/sickfit-domain.sql` è stato eseguito dall’utente il 21 novembre 2026; il readback catalogo ha trovato le RPC e le policy attese, ma non ne ha testato il comportamento. La Edge Function resta locale e non distribuita. Prima del deploy servono revisione CORS/rate limiting/segreti e test controllati.

Riferimenti: [`contratto API`](../../api-contract.md), [`schema dati/API`](../../data-and-api-schema.md), [`SQL RPC`](../../sickfit-domain.sql).
