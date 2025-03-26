<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        //
    }

    public function register(){
    $this->app->bind(
        \App\Repositories\ExerciseSetRepository::class,

        \App\Repositories\WorkoutRepository::class,
        \App\Repositories\WorkoutRepository::class,

        function ($app) {
            return new \App\Repositories\ExerciseSetRepository();
        }
    );
}
}
