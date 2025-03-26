<?php

// app/Http/Controllers/ExerciseController.php
namespace App\Http\Controllers;

use App\Models\Exercise;
use Illuminate\Http\Request;

class ExerciseController extends Controller{

    // public function __construct(
    //     private ExerciseSetRepository $repo
    // ) {}

    public function index()
    {
        $exercises = Exercise::all();
        // return view('index',[
        //     'exerciseSets' => $this->repo->getPaginated(perPage: 10)
        // ]);
    }
}