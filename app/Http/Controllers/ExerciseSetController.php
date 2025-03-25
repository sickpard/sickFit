<?php
namespace App\Http\Controllers;

use App\Repositories\ExerciseSetRepository;

class ExerciseSetController extends Controller
{
    public function __construct(
        private ExerciseSetRepository $repo
    ) {}

    public function index()
    {
        return view('index', [
            'exerciseSets' => $this->repo->getPaginated(perPage: 10)
        ]);
    }
}