<!-- resources/views/welcome.blade.php -->
@extends('layouts.app')

@section('title', 'Benvenuto in GYMTRACK')

@section('content')
    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Le mie Serie</h1>
        <a href="{{ route('exercise-sets.create') }}" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
            Nuova Serie
        </a>
    </div>

    <!-- Grid Schede -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($exerciseSets as $exerciseSet)
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-xl font-semibold text-gray-800">{{ $exerciseSet->exercise->name }}</h3>
                    <p class="text-sm text-gray-500">Serie #{{ $exerciseSet->set_number }}</p>
                </div>
                <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {{ optional($exerciseSet->created_at)->format('d/m/Y') ?? 'N/A' }}
                </span>
            </div>
            
            <div class="mb-4 space-y-2">
                <div class="flex justify-between">
                    <span>Ripetizioni:</span>
                    <span class="font-semibold">{{ $exerciseSet->repetitions }}</span>
                </div>
                <div class="flex justify-between">
                    <span>Peso (kg):</span>
                    <span class="font-semibold">{{ $exerciseSet->weight }}</span>
                </div>
                <div class="flex justify-between">
                    <span>Recupero (sec):</span>
                    <span class="font-semibold">{{ $exerciseSet->rest_time }}</span>
                </div>
                <div class="flex justify-between">
                    <span>Spottato:</span>
                    <span class="font-semibold">{{ $exerciseSet->spottato ? '✅' : '❌' }}</span>
                </div>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
                <span>{{ optional($exerciseSet->created_at)->diffForHumans() ?? 'N/A' }}</span>
                <div class="space-x-2">
                    <a href="{{ route('exercise-sets.edit', $exerciseSet) }}" class="text-blue-500 hover:text-blue-600">Modifica</a>
                    <form action="{{ route('exercise-sets.destroy', $exerciseSet) }}" method="POST" class="inline">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="text-red-500 hover:text-red-600">Elimina</button>
                    </form>
                </div>
            </div>
        </div>
        @endforeach
    </div>

    @if($exerciseSets->isEmpty())
    <div class="text-center py-12">
        <p class="text-gray-500 mb-4">Nessuna serie registrata</p>
        <a href="{{ route('exercise-sets.create') }}" class="text-blue-500 hover:text-blue-600">Aggiungi la tua prima serie</a>
    </div>
    @endif
@endsection