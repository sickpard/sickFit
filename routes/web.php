<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    ExerciseController,
    ExerciseSetController,
    WorkoutController,
    AuthController
};


Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Homepage
Route::get('/', function () { 
    return view('index');
})->name('home');

// Workouts
Route::resource('workouts', WorkoutController::class);
