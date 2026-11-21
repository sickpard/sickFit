-- SickFit domain API v1: executed by the user on the SickFit Supabase project on 2026-11-21.
-- Read-only catalog readback confirmed the five functions, RLS/policies, effective table
-- privileges, domain columns/constraints, and updated_at triggers. RPC behavior is untested.
-- Do NOT rerun blindly: CREATE OR REPLACE changes function definitions and ACLs.
-- This script does not create tables, policies, foreign keys, indexes, or table grants.
-- Recheck the live schema, FK delete behavior, RLS, grants, overloads and intended target
-- before any rerun or edit; current catalog readback does not prove runtime correctness.
-- Execute only with explicit authorization, after review and testing against an isolated DB.
-- All functions are SECURITY INVOKER: auth.uid() + existing RLS and table privileges apply.
-- PostgREST calls each function in ONE transaction. Any exception rolls back all writes.
-- Unqualified builtins resolve through pg_catalog; objects are schema-qualified.

BEGIN;

CREATE OR REPLACE FUNCTION public.sickfit_plan_save(
  p_name text, p_plan_id uuid, p_days jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $fn$
DECLARE
  v_user uuid := auth.uid();
  v_plan public.training_plans%ROWTYPE;
  v_plan_id uuid;
  v_version_id uuid;
  v_number integer;
  v_day_id uuid;
  v_exercise_id uuid;
  d jsonb;
  e jsonb;
  a jsonb;
  day_position integer := 0;
  exercise_position integer;
  alternative_position integer;
  n_min integer;
  n_max integer;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  IF p_name IS NULL OR length(btrim(p_name)) NOT BETWEEN 1 AND 160 OR
     p_days IS NULL OR jsonb_typeof(p_days) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_INPUT';
  END IF;
  IF jsonb_array_length(p_days) NOT BETWEEN 1 AND 31 OR length(p_days::text) > 256000 THEN
    RAISE EXCEPTION 'INVALID_INPUT';
  END IF;

  -- Lock the parent: two concurrent edits cannot obtain the same version number.
  IF p_plan_id IS NULL THEN
    INSERT INTO public.training_plans(user_id, name)
    VALUES (v_user, btrim(p_name)) RETURNING id INTO v_plan_id;
  ELSE
    SELECT * INTO v_plan FROM public.training_plans
      WHERE id = p_plan_id AND user_id = v_user FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
    IF v_plan.archived_at IS NOT NULL OR v_plan.name <> btrim(p_name) THEN
      -- Names are immutable: historical sessions resolve names through the plan.
      RAISE EXCEPTION 'CONFLICT';
    END IF;
    v_plan_id := p_plan_id;
  END IF;
  SELECT coalesce(max(version_number), 0) + 1 INTO v_number
    FROM public.plan_versions WHERE training_plan_id = v_plan_id AND user_id = v_user;
  INSERT INTO public.plan_versions(user_id, training_plan_id, version_number)
    VALUES (v_user, v_plan_id, v_number) RETURNING id INTO v_version_id;

  FOR d IN SELECT value FROM jsonb_array_elements(p_days) AS t(value) LOOP
    IF jsonb_typeof(d) IS DISTINCT FROM 'object' OR
       jsonb_typeof(d->'name') IS DISTINCT FROM 'string' OR
       length(btrim(d->>'name')) NOT BETWEEN 1 AND 160 OR
       jsonb_typeof(d->'exercises') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'INVALID_INPUT';
    END IF;
    IF jsonb_array_length(d->'exercises') NOT BETWEEN 1 AND 100 THEN
      RAISE EXCEPTION 'INVALID_INPUT';
    END IF;
    day_position := day_position + 1;
    INSERT INTO public.plan_days(user_id, plan_version_id, name, position)
      VALUES (v_user, v_version_id, btrim(d->>'name'), day_position)
      RETURNING id INTO v_day_id;
    exercise_position := 0;
    FOR e IN SELECT value FROM jsonb_array_elements(d->'exercises') AS t(value) LOOP
      IF jsonb_typeof(e) IS DISTINCT FROM 'object' OR
         jsonb_typeof(e->'name') IS DISTINCT FROM 'string' OR
         length(btrim(e->>'name')) NOT BETWEEN 1 AND 160 OR
         jsonb_typeof(e->'min') IS DISTINCT FROM 'number' OR
         jsonb_typeof(e->'max') IS DISTINCT FROM 'number' OR
         jsonb_typeof(e->'optional') IS DISTINCT FROM 'boolean' OR
         jsonb_typeof(e->'alternatives') IS DISTINCT FROM 'array' OR
         jsonb_typeof(e->'notes') NOT IN ('string', 'null') THEN
        RAISE EXCEPTION 'INVALID_INPUT';
      END IF;
      IF (e->>'min') !~ '^(0|[1-9][0-9]{0,3})$' OR
         (e->>'max') !~ '^(0|[1-9][0-9]{0,3})$' OR
         length(coalesce(e->>'notes', '')) > 2000 OR
         jsonb_array_length(e->'alternatives') > 20 THEN
        RAISE EXCEPTION 'INVALID_INPUT';
      END IF;
      n_min := (e->>'min')::integer;
      n_max := (e->>'max')::integer;
      IF n_max < n_min THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
      exercise_position := exercise_position + 1;
      INSERT INTO public.plan_exercises
        (user_id, plan_day_id, name, position, target_sets_min, target_sets_max,
         is_optional, prescription_notes)
      VALUES (v_user, v_day_id, btrim(e->>'name'), exercise_position, n_min, n_max,
              (e->>'optional')::boolean, nullif(btrim(e->>'notes'), ''))
      RETURNING id INTO v_exercise_id;
      alternative_position := 0;
      FOR a IN SELECT value FROM jsonb_array_elements(e->'alternatives') AS t(value) LOOP
        IF jsonb_typeof(a) <> 'string' OR length(btrim(a #>> '{}')) NOT BETWEEN 1 AND 160 THEN
          RAISE EXCEPTION 'INVALID_INPUT';
        END IF;
        alternative_position := alternative_position + 1;
        INSERT INTO public.plan_exercise_alternatives
          (user_id, plan_exercise_id, name, position)
        VALUES (v_user, v_exercise_id, btrim(a #>> '{}'), alternative_position);
      END LOOP;
    END LOOP;
  END LOOP;
  RETURN v_plan_id;
END
$fn$;

CREATE OR REPLACE FUNCTION public.sickfit_plan_archive(p_plan_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $fn$
DECLARE
  v_user uuid := auth.uid();
  v_id uuid;
  v_archived timestamptz;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  IF p_plan_id IS NULL THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
  SELECT id, archived_at INTO v_id, v_archived FROM public.training_plans
    WHERE id = p_plan_id AND user_id = v_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF v_archived IS NOT NULL THEN RAISE EXCEPTION 'CONFLICT'; END IF;
  UPDATE public.training_plans SET archived_at = now(), updated_at = now()
    WHERE id = v_id AND user_id = v_user AND archived_at IS NULL RETURNING id INTO v_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  RETURN v_id;
END
$fn$;

CREATE OR REPLACE FUNCTION public.sickfit_workout_start(
  p_version_id uuid, p_day_id uuid
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $fn$
DECLARE
  v_user uuid := auth.uid();
  v_id uuid;
  v_plan_id uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  IF p_version_id IS NULL OR p_day_id IS NULL THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
  -- Serialize starts per user so concurrent requests cannot create two open sessions.
  PERFORM pg_catalog.pg_advisory_xact_lock(731204, pg_catalog.hashtext(v_user::text));
  IF EXISTS (SELECT 1 FROM public.workout_sessions
    WHERE user_id = v_user AND status = 'in_progress') THEN
    RAISE EXCEPTION 'CONFLICT';
  END IF;
  -- A saved day belongs to the requested version, user and non-archived plan.
  SELECT p.id INTO v_plan_id
    FROM public.plan_days d
    JOIN public.plan_versions v ON v.id = d.plan_version_id AND v.user_id = d.user_id
    JOIN public.training_plans p ON p.id = v.training_plan_id AND p.user_id = v.user_id
    WHERE d.id = p_day_id AND d.plan_version_id = p_version_id AND d.user_id = v_user
      AND p.archived_at IS NULL
    FOR SHARE OF p;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  INSERT INTO public.workout_sessions(user_id, plan_version_id, plan_day_id)
    VALUES (v_user, p_version_id, p_day_id) RETURNING id INTO v_id;
  RETURN v_id;
END
$fn$;

CREATE OR REPLACE FUNCTION public.sickfit_workout_complete(
  p_session_id uuid, p_exercises jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $fn$
DECLARE
  v_user uuid := auth.uid();
  v_session public.workout_sessions%ROWTYPE;
  v_exercise_id uuid;
  v_alternative_id uuid;
  v_workout_exercise_id uuid;
  v_set_id uuid;
  x jsonb;
  s jsonb;
  n jsonb;
  exercise_position integer := 0;
  set_position integer;
  note_position integer;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  IF p_session_id IS NULL OR p_exercises IS NULL OR jsonb_typeof(p_exercises) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_INPUT';
  END IF;
  IF jsonb_array_length(p_exercises) NOT BETWEEN 1 AND 100 OR length(p_exercises::text) > 256000 THEN
    RAISE EXCEPTION 'INVALID_INPUT';
  END IF;
  SELECT * INTO v_session FROM public.workout_sessions
    WHERE id = p_session_id AND user_id = v_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF v_session.status <> 'in_progress' OR EXISTS (
    SELECT 1 FROM public.workout_exercises
    WHERE workout_session_id = p_session_id AND user_id = v_user
  ) THEN RAISE EXCEPTION 'CONFLICT'; END IF;

  FOR x IN SELECT value FROM jsonb_array_elements(p_exercises) AS t(value) LOOP
    IF jsonb_typeof(x) IS DISTINCT FROM 'object' OR
       jsonb_typeof(x->'planExerciseId') IS DISTINCT FROM 'string' OR
       (x->>'planExerciseId') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' OR
       jsonb_typeof(x->'selectedAlternativeId') NOT IN ('string', 'null') OR
       jsonb_typeof(x->'actualName') IS DISTINCT FROM 'string' OR
       length(btrim(x->>'actualName')) NOT BETWEEN 1 AND 160 OR
       coalesce(x->>'status', '') NOT IN ('completed', 'skipped') OR
       jsonb_typeof(x->'sets') IS DISTINCT FROM 'array' THEN
      RAISE EXCEPTION 'INVALID_INPUT';
    END IF;
    IF jsonb_array_length(x->'sets') > 100 THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
    IF x->>'status' = 'skipped' AND jsonb_array_length(x->'sets') <> 0 THEN
      RAISE EXCEPTION 'INVALID_INPUT';
    END IF;
    v_exercise_id := (x->>'planExerciseId')::uuid;
    IF NOT EXISTS (SELECT 1 FROM public.plan_exercises
      WHERE id = v_exercise_id AND user_id = v_user AND plan_day_id = v_session.plan_day_id) THEN
      RAISE EXCEPTION 'INVALID_INPUT';
    END IF;
    IF EXISTS (SELECT 1 FROM public.workout_exercises
      WHERE workout_session_id = p_session_id AND user_id = v_user AND plan_exercise_id = v_exercise_id) THEN
      RAISE EXCEPTION 'INVALID_INPUT';
    END IF;
    v_alternative_id := NULL;
    IF x->>'selectedAlternativeId' IS NOT NULL THEN
      IF (x->>'selectedAlternativeId') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        RAISE EXCEPTION 'INVALID_INPUT';
      END IF;
      v_alternative_id := (x->>'selectedAlternativeId')::uuid;
      IF NOT EXISTS (SELECT 1 FROM public.plan_exercise_alternatives
        WHERE id = v_alternative_id AND user_id = v_user AND plan_exercise_id = v_exercise_id) THEN
        RAISE EXCEPTION 'INVALID_INPUT';
      END IF;
    END IF;
    exercise_position := exercise_position + 1;
    INSERT INTO public.workout_exercises
      (user_id, workout_session_id, plan_day_id, plan_exercise_id,
       selected_alternative_id, actual_name, status, position)
    VALUES (v_user, p_session_id, v_session.plan_day_id, v_exercise_id,
            v_alternative_id, btrim(x->>'actualName'), x->>'status', exercise_position)
    RETURNING id INTO v_workout_exercise_id;

    set_position := 0;
    FOR s IN SELECT value FROM jsonb_array_elements(x->'sets') AS t(value) LOOP
      IF jsonb_typeof(s) IS DISTINCT FROM 'object' OR
         jsonb_typeof(s->'reps') NOT IN ('number', 'null') OR
         jsonb_typeof(s->'weightKg') NOT IN ('number', 'null') OR
         jsonb_typeof(s->'durationSeconds') NOT IN ('number', 'null') OR
         coalesce(s->>'loadBasis', '') NOT IN ('per_side', 'total') OR
         jsonb_typeof(s->'notes') IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'INVALID_INPUT';
      END IF;
      IF jsonb_array_length(s->'notes') > 20 THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
      IF s->>'reps' IS NOT NULL AND
         ((s->>'reps') !~ '^[1-9][0-9]{0,6}$' OR
          (s->>'reps')::numeric > 1000000) THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
      IF s->>'weightKg' IS NOT NULL AND
         ((s->>'weightKg')::numeric < 0 OR (s->>'weightKg')::numeric > 1000000) THEN
        RAISE EXCEPTION 'INVALID_INPUT';
      END IF;
      IF s->>'durationSeconds' IS NOT NULL AND
         ((s->>'durationSeconds') !~ '^[1-9][0-9]{0,9}$' OR
          (s->>'durationSeconds')::numeric > 2147483647) THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
      set_position := set_position + 1;
      INSERT INTO public.exercise_sets
        (user_id, workout_exercise_id, position, reps, weight_kg, duration_seconds, load_basis)
      VALUES (v_user, v_workout_exercise_id, set_position, (s->>'reps')::integer,
              (s->>'weightKg')::numeric, (s->>'durationSeconds')::integer, s->>'loadBasis') RETURNING id INTO v_set_id;
      note_position := 0;
      FOR n IN SELECT value FROM jsonb_array_elements(s->'notes') AS t(value) LOOP
        IF jsonb_typeof(n) <> 'string' OR length(btrim(n #>> '{}')) NOT BETWEEN 1 AND 2000 THEN
          RAISE EXCEPTION 'INVALID_INPUT';
        END IF;
        note_position := note_position + 1;
        INSERT INTO public.set_notes(user_id, exercise_set_id, text, position)
        VALUES (v_user, v_set_id, btrim(n #>> '{}'), note_position);
      END LOOP;
    END LOOP;
  END LOOP;
  UPDATE public.workout_sessions SET status = 'completed', completed_at = now(), updated_at = now()
    WHERE id = p_session_id AND user_id = v_user AND status = 'in_progress';
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  RETURN p_session_id;
END
$fn$;

CREATE OR REPLACE FUNCTION public.sickfit_workout_cancel(p_session_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $fn$
DECLARE
  v_user uuid := auth.uid();
  v_status text;
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  IF p_session_id IS NULL THEN RAISE EXCEPTION 'INVALID_INPUT'; END IF;
  SELECT status INTO v_status FROM public.workout_sessions
    WHERE id = p_session_id AND user_id = v_user FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  -- Never delete a completed or partly persisted legacy session. No cascade assumed.
  IF v_status <> 'in_progress' OR EXISTS (
    SELECT 1 FROM public.workout_exercises
    WHERE workout_session_id = p_session_id AND user_id = v_user
  ) THEN RAISE EXCEPTION 'CONFLICT'; END IF;
  DELETE FROM public.workout_sessions WHERE id = p_session_id AND user_id = v_user
    AND status = 'in_progress' RETURNING id INTO v_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  RETURN v_id;
END
$fn$;

-- Function EXECUTE is PUBLIC by default in PostgreSQL: explicitly narrow it.
REVOKE ALL ON FUNCTION public.sickfit_plan_save(text, uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sickfit_plan_archive(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sickfit_workout_start(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sickfit_workout_complete(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.sickfit_workout_cancel(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sickfit_plan_save(text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sickfit_plan_archive(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sickfit_workout_start(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sickfit_workout_complete(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sickfit_workout_cancel(uuid) TO authenticated;
COMMIT;

-- REQUIRED PRE-DEPLOY REVIEW (read-only audit; do not infer live state from this file):
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables
--  WHERE schemaname='public' AND tablename IN
--  ('training_plans','plan_versions','plan_days','plan_exercises',
--   'plan_exercise_alternatives','workout_sessions','workout_exercises',
--   'exercise_sets','set_notes');
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
--  FROM pg_policies WHERE schemaname='public' AND tablename IN
--  ('training_plans','plan_versions','plan_days','plan_exercises',
--   'plan_exercise_alternatives','workout_sessions','workout_exercises',
--   'exercise_sets','set_notes');
-- SELECT table_name, privilege_type FROM information_schema.role_table_grants
--  WHERE table_schema='public' AND grantee='authenticated';
-- Confirm authenticated SELECT on all nine tables, INSERT on plan/version/day/exercise/
-- alternatives and session/exercise/set/note, UPDATE on training_plans and workout_sessions,
-- DELETE on workout_sessions; matching owner-scoped USING and WITH CHECK policies.
-- Also review sequence privileges if schema defaults use sequences (UUID defaults do not),
-- function execute privileges, column-level grants and any FORCE RLS / trigger behavior.
-- In particular archive requires UPDATE on training_plans and cancel requires DELETE on
-- workout_sessions. If absent, BOTH the grant and owner-scoped policy must be reviewed;
-- do not silently skip those actions. Examples ONLY, choose nonconflicting policy names,
-- ensure no existing permissive policies broaden access, and execute separately if approved:
-- GRANT UPDATE ON public.training_plans TO authenticated;
-- CREATE POLICY sickfit_owner_update ON public.training_plans FOR UPDATE TO authenticated
--   USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
-- GRANT DELETE ON public.workout_sessions TO authenticated;
-- CREATE POLICY sickfit_owner_delete ON public.workout_sessions FOR DELETE TO authenticated
--   USING (user_id = (SELECT auth.uid()));
-- SQL functions do not install these examples; policy/grant review is mandatory for ALL
-- mutations and reads, not just archive/delete. PostgreSQL DELETE also needs SELECT visibility.
-- No runtime/DB verification was performed for this local script.
