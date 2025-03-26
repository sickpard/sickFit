<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    ExerciseController,
    ExerciseSetController,
    WorkoutController
};

// Homepage (Workout)
Route::get('/', [WorkoutController::class, 'index'])->name('home');

// Workouts (con tutte le route RESTful)
Route::resource('workouts', WorkoutController::class);

// Exercise Sets (se necessario, decommenta)
// Route::resource('exercise-sets', ExerciseSetController::class);

// Exercises (se NON ti servono, rimuovi il link dal layout)
// Route::resource('exercises', ExerciseController::class);