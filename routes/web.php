<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ExerciseSetController;

Route::get('/', function () {
    return view('welcome');
});

Route::resource('exercises', ExerciseController::class);
Route::resource('exercise-sets', ExerciseSetController::class);

Route::get('/', function () {
    $exerciseSets = App\Models\ExerciseSet::with('exercise')->latest()->get();
    return view('welcome', compact('exerciseSets'));
});