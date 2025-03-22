<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExerciseSet extends Model
{
    use HasFactory;

    protected $fillable = [
        'exercise_id',
        'set_number',
        'repetitions',
        'weight',
        'rest_time',
        'spottato',
    ];

    public function exercise()
    {
        return $this->belongsTo(Exercise::class);
    }
}