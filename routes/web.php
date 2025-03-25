<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\ExerciseSetController;

// Route::get('/', function () {
//     return view('index');
// });

Route::resource('exercises', ExerciseController::class);

Route::get('/', [ExerciseSetController::class, 'index'])->name('home');
Route::resource('exercise-sets', ExerciseSetController::class);


// Route::get('/', function () {
//     $exerciseSets = App\Models\ExerciseSet::with('exercise')->latest()->get();
//     return view('index', compact('exerciseSets'));
// });