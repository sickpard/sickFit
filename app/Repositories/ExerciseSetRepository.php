<?php
// app/Repositories/ExerciseSetRepository.php
namespace App\Repositories;

use App\Models\ExerciseSet;
use Illuminate\Pagination\LengthAwarePaginator;

class ExerciseSetRepository
{
    public function getPaginated(int $perPage): LengthAwarePaginator
    {
        return ExerciseSet::with('exercise')
            ->latest()
            ->paginate($perPage);
    }
}