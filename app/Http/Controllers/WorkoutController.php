<?php

namespace App\Http\Controllers;

use App\Models\Workout;
use Illuminate\Http\Request;
use App\Repositories\WorkoutRepository;



class WorkoutController extends Controller{
    public function __construct(
        private WorkoutRepository $workoutRepo
    ) {}

    public function index()
    {
        return view('index', [
            'workouts' => $this->workoutRepo->getAll()
        ]);
    }

    public function store(Request $request)
    {
        $workout = $this->workoutRepo->create($request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]));

        return redirect()->route('workouts.show', $workout);
    }
}