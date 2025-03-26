<?php

namespace App\Repositories;

use App\Models\Workout;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;


class WorkoutRepository{
    public function getAll(): Collection
    {
        return Workout::with('exercises')->latest()->get();
    }

    public function create(array $data): Workout
    {
        return Workout::create($data);
    }
}