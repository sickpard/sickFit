<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workout extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
    ];

    public function exercises(){
        return $this->hasMany(Exercise::class);
    }

    // public function user(){
    //     return $this->belongsTo(User::class);
    // }
}
