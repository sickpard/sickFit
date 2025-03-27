<header class="bg-indigo-600 text-white shadow-md">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <!-- Logo -->
        <a href="{{ url('/') }}" class="text-2xl font-bold tracking-tight">
            GYM<span class="text-amber-300">TRACK</span>
        </a>
        
        <div class="flex items-center space-x-4">
            <!-- Navigazione -->
            <nav class="hidden md:flex space-x-6">
                <a href="{{ route('workouts.index') }}" 
                   class="px-3 py-1 rounded hover:bg-indigo-500 transition {{ request()->routeIs('workouts.*') ? 'bg-indigo-700' : '' }}">
                   Workout
                </a>
                <a href="{{ route('login') }}" class="px-3 py-1 rounded hover:bg-indigo-500 transition">
                    Login
                </a>
            </nav>

            <!-- Bottone per Workouts -->
            <a href="{{ route('workouts.index') }}" 
               class="bg-amber-300 text-indigo-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-400 transition">
               Vai ai Workout
            </a>
        </div>
    </div>
</header>
