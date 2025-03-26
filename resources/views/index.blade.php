<!-- resources/views/welcome.blade.php -->
@extends('layouts.app')

@section('title', 'Benvenuto in GYMTRACK')

@section('content')
<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Tutti i Workout</h1>
    
    <div class="grid gap-4">
        @foreach($workouts as $workout)
        <div class="bg-white p-4 rounded shadow">
            <h2 class="text-xl font-semibold">{{ $workout->name }}</h2>
            @if($workout->description)
                <p class="text-gray-600 mt-2">{{ $workout->description }}</p>
            @endif
            
            <div class="mt-3">
                <h3 class="font-medium">Esercizi:</h3>
                <ul class="list-disc pl-5">
                    @foreach($workout->exercises as $exercise)
                    <li>{{ $exercise->name }}</li>
                    @endforeach
                </ul>
            </div>
        </div>
        @endforeach
    </div>
</div>
@endsection