<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('exercises', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('workout_id');
        $table->string('name');
        $table->text('desc')->nullable();
        $table->timestamps();

        $table->foreign('workout_id')->references('id')->on('workouts')->onDelete('cascade');
    });
}

    public function down()
    {
        Schema::dropIfExists('exercises');
    }
};
