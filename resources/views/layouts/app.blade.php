<!-- resources/views/layouts/app.blade.php -->
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'My Laravel App')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    {{-- @livewireStyles --}}
</head>
<body class="bg-gray-100">
    <!-- Header -->
    <header class="bg-gray-800 text-white py-4">
        <div class="container mx-auto px-4 flex justify-between items-center">
            <div class="flex items-center">
                <a href="/" class="text-2xl font-bold">GYM<span class="text-blue-400">TRACK</span></a>
            </div>
            
            <nav class="space-x-6">
                <a href="{{ route('exercises.index') }}" class="hover:text-blue-400">Esercizi</a>
                <a href="{{ route('exercise-sets.index') }}" class="hover:text-blue-400">Serie</a>
                <a href="#" class="hover:text-blue-400">Profilo</a>
            </nav>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
        @yield('content') <!-- Qui verrà inserito il contenuto delle pagine -->
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-4 mt-8">
        <div class="container mx-auto px-4 text-center">
            &copy; {{ date('Y') }} GYMTRACK. Tutti i diritti riservati.
        </div>
    </footer>

    {{-- @livewireScripts --}}
</body>
</html>