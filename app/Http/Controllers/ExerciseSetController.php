<?php

// app/Http/Controllers/ExerciseSetController.php
namespace App\Http\Controllers;

use App\Models\Exercise;
use App\Models\ExerciseSet;
use Illuminate\Http\Request;

class ExerciseSetController extends Controller
{
    public function index()
    {
        $exerciseSets = ExerciseSet::with('exercise')->latest()->get();
        return view('exercise_sets.index', compact('exerciseSets'));
    }

    public function create()
    {
        $exercises = Exercise::all(); // Per popolare un dropdown
        return view('exercise_sets.create', compact('exercises'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'exercise_id' => 'required|exists:exercises,id',
            'sets' => 'required|integer|min:1',
            'reps' => 'required|integer|min:1',
            'date' => 'required|date',
        ]);

        ExerciseSet::create($request->all());
        return redirect()->route('exercise-sets.index');
    }

    // Aggiungi edit, update, destroy...
}