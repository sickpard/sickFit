<!-- resources/views/layouts/app.blade.php -->
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'GYMTRACK')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <!-- Header Semplificato -->
    <header class="bg-indigo-600 text-white shadow-md">
        <div class="container mx-auto px-4 py-3">
            <div class="flex justify-between items-center">
                <a href="{{ url('/') }}" class="text-2xl font-bold tracking-tight">
                    GYM<span class="text-amber-300">TRACK</span>
                </a>
                
                <nav class="hidden md:flex space-x-6">
                    <a href="{{ route('workouts.index') }}" 
                       class="px-3 py-1 rounded hover:bg-indigo-500 transition {{ request()->routeIs('workouts.*') ? 'bg-indigo-700' : '' }}">
                       Workout
                    </a>
                    
                    {{-- Solo se hai bisogno degli esercizi --}}
                    {{-- @if(Route::has('exercises.index'))
                    <a href="{{ route('exercises.index') }}" 
                       class="px-3 py-1 rounded hover:bg-indigo-500 transition {{ request()->routeIs('exercises.*') ? 'bg-indigo-700' : '' }}">
                       Esercizi
                    </a>
                    @endif --}}
                </nav>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6 min-h-screen">
        <!-- Messaggi Flash -->
        @if(session('success'))
        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
            <p>{{ session('success') }}</p>
        </div>
        @endif

        @yield('content')
    </main>

    <!-- Footer Base -->
    <footer class="bg-gray-800 text-white py-4">
        <div class="container mx-auto px-4 text-center text-sm">
            &copy; {{ date('Y') }} GYMTRACK - Tutti i diritti riservati
        </div>
    </footer>
</body>
</html>