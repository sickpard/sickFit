<!-- resources/views/welcome.blade.php -->
@extends('layouts.app')

@section('title', 'GYMTRACK - Dashboard')

@section('content')


<div class="container mx-auto p-4">
    <!-- Sezione Benvenuto -->
    <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-indigo-700 mb-2">Benvenuto su GYMTRACK</h1>
        @auth
            <p class="text-xl text-gray-600">Ciao, {{ Auth::user()->name }}!</p>
        @else
            <p class="text-xl text-gray-600">Il tuo compagno di allenamento digitale</p>
        @endauth
    </div>

    <!-- Sezione Schede Allenamento -->
    <section class="mb-12">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">Le tue schede</h2>
            <a href="{{ route('workouts.create') }}" 
               class="bg-amber-400 hover:bg-amber-500 text-indigo-900 font-bold py-2 px-4 rounded-lg transition">
               + Nuova Scheda
            </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Card Scheda 1 -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-indigo-700 mb-2">Full Body</h3>
                    <p class="text-gray-600 mb-4">3 esercizi • Ultimo allenamento: 2 giorni fa</p>
                    <div class="flex space-x-2">
                        <a href="#" class="text-indigo-600 hover:text-indigo-800 font-medium">Inizia</a>
                        <a href="#" class="text-gray-500 hover:text-gray-700 font-medium">Dettagli</a>
                    </div>
                </div>
            </div>

            <!-- Card Scheda 2 -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-indigo-700 mb-2">Upper Body</h3>
                    <p class="text-gray-600 mb-4">4 esercizi • Ultimo allenamento: 1 settimana fa</p>
                    <div class="flex space-x-2">
                        <a href="#" class="text-indigo-600 hover:text-indigo-800 font-medium">Inizia</a>
                        <a href="#" class="text-gray-500 hover:text-gray-700 font-medium">Dettagli</a>
                    </div>
                </div>
            </div>

            <!-- Card Scheda Vuota -->
            <div class="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                <a href="{{ route('workouts.create') }}" class="p-6 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p class="mt-2 text-gray-500">Crea nuova scheda</p>
                </a>
            </div>
        </div>
    </section>

    <!-- Sezione Statistiche -->
    <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Le tue statistiche</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Card Statistica 1 -->
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-medium text-gray-900 mb-2">Allenamenti completati</h3>
                <p class="text-3xl font-bold text-indigo-600">12</p>
            </div>
            
            <!-- Card Statistica 2 -->
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-medium text-gray-900 mb-2">Serie totali</h3>
                <p class="text-3xl font-bold text-indigo-600">84</p>
            </div>
            
            <!-- Card Statistica 3 -->
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-medium text-gray-900 mb-2">Media per sessione</h3>
                <p class="text-3xl font-bold text-indigo-600">7</p>
            </div>
        </div>
    </section>

    <!-- Sezione Ultimi Allenamenti -->
    <section>
        <h2 class="text-2xl font-semibold text-gray-800 mb-6">Ultimi allenamenti</h2>
        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheda</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durata</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Esercizi</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">20/03/2023</td>
                        <td class="px-6 py-4 whitespace-nowrap">Full Body</td>
                        <td class="px-6 py-4 whitespace-nowrap">45 min</td>
                        <td class="px-6 py-4 whitespace-nowrap">5</td>
                    </tr>
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">18/03/2023</td>
                        <td class="px-6 py-4 whitespace-nowrap">Upper Body</td>
                        <td class="px-6 py-4 whitespace-nowrap">35 min</td>
                        <td class="px-6 py-4 whitespace-nowrap">4</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>
</div>
@endsection