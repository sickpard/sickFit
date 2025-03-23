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

    public function getCreatedAtFormattedAttribute()
{
    return $this->created_at ? $this->created_at->format('d/m/Y') : 'N/A';
}
}