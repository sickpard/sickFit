INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES (
    'Admin',
    'admin@sickpard.com',
    'admin', -- Usa Hash::make('admin') in Laravel per la password
    'admin', -- Specifica il ruolo
    NOW(),
    NOW()
);

INSERT INTO workouts (user_id, name, description, created_at, updated_at)
VALUES (1, 'Scheda di sickpard', 'Scheda completa Sickpard', NOW(), NOW());
-- ==========================================================

-- Flyes in piedi 35


-- Chest press inclinata 24
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Chest press inclinata', 'Petto', NOW(), NOW());


INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(1, 1, 6, 24.0, 180, 0),
(1, 2, 8, 24.0, 180, 0),
(1, 3, 5, 24.0, 180, 0),
(1, 4, 8, 24.0, 180, 0),
(1, 5, 7, 24.0, 180, 0),
(1, 6, 6, 24.0, 180, 0),
(1, 7, 8, 24.0, 180, 0),
(1, 8, 7, 24.0, 180, 1), -- Spottato
(1, 9, 5, 24.0, 180, 0);

INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Flyes in piedi', 'Petto', NOW(), NOW());


INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(2, 1, 10, 25.0, 180, 0),
(2, 2, 10, 25.0, 180, 0),
(2, 3, 8, 25.0, 180, 0),
(2, 4, 9, 30.0, 180, 0),
(2, 5, 7, 30.0, 180, 0),
(2, 6, 3, 30.0, 180, 0),
(2, 7, 8, 30.0, 180, 0),
(2, 8, 7, 30.0, 180, 0),
(2, 9, 6, 30.0, 180, 0);

-- Chest Nicola 30
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Chest Nicola', 'Petto', NOW(), NOW());


INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(3, 1, 6, 30.0, 180, 0),
(3, 2, 7, 30.0, 180, 0),
(3, 3, 5, 30.0, 180, 0),
(3, 4, 7, 30.0, 180, 0),
(3, 5, 5, 30.0, 180, 0);

-- -----------------------------------------------------------
-- ESERCIZI BICIPITI
-- -----------------------------------------------------------

-- Curl martello seduto 16
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Curl martello seduto', 'Bicipiti', NOW(), NOW());


INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(4, 1, 9, 16.0, 90, 0),
(4, 2, 8, 16.0, 90, 0),
(4, 3, 6, 16.0, 90, 0),
(4, 4, 10, 16.0, 90, 0),
(4, 5, 7, 16.0, 90, 0);

-- Curl Scott 7.5
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Curl Scott', 'Bicipiti', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(5, 1, 9, 7.5, 90, 0),
(5, 2, 7, 7.5, 90, 0),
(5, 3, 6, 7.5, 90, 0),
(5, 4, 12, 7.5, 90, 0),
(5, 5, 8, 7.5, 90, 0);



-- -----------------------------------------------------------
-- ESERCIZI GAMBE
-- -----------------------------------------------------------

-- Stacchi gambe semitese 30
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Stacchi gambe semitese', 'Gambe - Stacchi rumeni', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(6, 1, 8, 30.0, 120, 0),
(6, 2, 8, 30.0, 120, 0),
(6, 3, 8, 30.0, 120, 0),
(6, 4, 8, 20.0, 120, 0),
(6, 5, 8, 20.0, 120, 0),
(6, 6, 8, 20.0, 120, 0),
(6, 7, 8, 22.5, 120, 0),
(6, 8, 8, 22.5, 120, 0);

-- Leg curl 30
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Leg curl', 'Gambe - Femorali', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(7, 1, 8, 30.0, 90, 0),
(7, 2, 8, 30.0, 90, 0),
(7, 3, 8, 30.0, 90, 0),
(7, 4, 8, 25.0, 90, 0),
(7, 5, 6, 25.0, 90, 0);

-- // sono fermo qui e mi da errore

-- Pressa 120
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Pressa', 'Gambe - Pressa orizzontale', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(10, 1, 8, 120.0, 150, 0),
(10, 2, 8, 120.0, 150, 0),
(10, 3, 10, 130.0, 150, 0),
(10, 4, 9, 130.0, 150, 0),
(10, 5, 10, 140.0, 150, 0);

-- Abductor 40
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Abductor', 'Gambe - Abduttori', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(11, 1, 10, 35.0, 60, 0),
(11, 2, 10, 35.0, 60, 0),
(11, 3, 8, 40.0, 60, 0),
(11, 4, 8, 40.0, 60, 0),
(11, 5, 6, 40.0, 60, 0);


-- Leg extension 45
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Leg extension', 'Gambe - Quadricipiti', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(12, 1, 12, 45.0, 90, 0),
(12, 2, 11, 45.0, 90, 0),
(12, 3, 10, 40.0, 90, 0),
(12, 4, 8, 40.0, 90, 0),
(12, 5, 7, 40.0, 90, 0);





-- -----------------------------------------------------------
-- ESERCIZI SPALLE
-- -----------------------------------------------------------

-- Spinte multipower 15
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Spinte multipower', 'Spalle - Shoulder press', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(13, 1, 9, 15.0, 90, 0),
(13, 2, 8, 15.0, 90, 0),
(13, 3, 5, 15.0, 90, 0),
(13, 4, 9, 45.0, 90, 0), -- Macchina con 45kg
(13, 5, 8, 45.0, 90, 0),
(13, 6, 7, 45.0, 90, 0);

-- Alzate laterali da seduto 10
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Alzate laterali da seduto', 'Spalle - Lateral raises', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(14, 1, 8, 10.0, 90, 0),
(14, 2, 6, 10.0, 90, 0),
(14, 3, 4, 10.0, 90, 0),
(14, 4, 8, 10.0, 90, 0),
(14, 5, 8, 10.0, 90, 0),
(14, 6, 7, 10.0, 90, 0);

-- Alzate laterali ai cavi 10
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Alzate laterali ai cavi', 'Spalle - Cable lateral raises', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(15, 1, 10, 10.0, 90, 0), -- sx=sinistro, dx=destro
(15, 2, 7, 10.0, 90, 0),
(15, 3, 9, 10.0, 90, 0), -- Nota: 9sx7dx
(15, 4, 7, 10.0, 90, 0),
(15, 5, 6, 10.0, 90, 0);

-- -----------------------------------------------------------
-- ESERCIZI POLPACCI
-- -----------------------------------------------------------

-- Polpacci macchina 30
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Polpacci macchina', 'Polpacci - Standing calf raises', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(16, 1, 8, 30.0, 60, 0),
(16, 2, 6, 30.0, 60, 0),
(16, 3, 10, 30.0, 60, 0),
(16, 4, 10, 30.0, 60, 0),
(16, 5, 8, 30.0, 60, 0);

-- Polpacci pressa 100
INSERT INTO exercises (workout_id, name, `desc`, created_at, updated_at)
VALUES (1, 'Polpacci pressa', 'Polpacci - Leg press calf raises', NOW(), NOW());

INSERT INTO exercise_sets (exercise_id, set_number, repetitions, weight, rest_time, spottato) VALUES
(17, 1, 10, 100.0, 60, 0),
(17, 2, 10, 100.0, 60, 0),  
(17, 3, 10, 100.0, 60, 0),
(17, 4, 9, 90.0, 60, 0),
(17, 5, 9, 90.0, 60, 0);