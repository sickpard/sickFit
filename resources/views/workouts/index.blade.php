@extends('layouts.app')

@section('title', 'Tutti i Workout')

@section('content')
<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Tutti i Workout</h1>

    <div class="grid gap-4">
        @forelse($workouts as $workout)
        <div class="bg-white p-4 rounded shadow">
            <h2 class="text-xl font-semibold">{{ $workout->name }}</h2>
            @if($workout->description)
                <p class="text-gray-600 mt-2">{{ $workout->description }}</p>
            @endif
        </div>
        @empty
        <p class="text-gray-500">Nessun workout disponibile.</p>
        @endforelse
    </div>
</div>
@endsection
