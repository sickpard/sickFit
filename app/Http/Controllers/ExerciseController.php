<?php

// app/Http/Controllers/ExerciseController.php
namespace App\Http\Controllers;

use App\Models\Exercise;
use Illuminate\Http\Request;

class ExerciseController extends Controller
{
    public function index()
    {
        $exercises = Exercise::all();
        return view('exercises.index', compact('exercises'));
    }

    public function create()
    {
        return view('exercises.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'muscle_group' => 'required|string',
        ]);

        Exercise::create($request->all());
        return redirect()->route('exercises.index');
    }

    // Aggiungi altri metodi (show, edit, update, destroy) se necessario
}