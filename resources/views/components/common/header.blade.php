<!-- Aggiungi questo stile nella sezione head del tuo layout -->
<style>
    body {
        padding-top: 68px; /* Altezza approssimativa dell'header, regola se necessario */
    }
    
    .header-transition {
        transition: all 0.3s ease;
    }
</style>

@php
    $navItems = [
        [ 'route' => 'workouts.index', 'text' => 'Workout', 'active' => request()->routeIs('workouts.*'), 'mobileOnly' => false ],
        [ 'route' => 'login', 'text' => 'Login', 'active' => request()->routeIs('login'), 'mobileOnly' => false ]
    ];
@endphp

<header id="header" class="header-transition fixed top-0 left-0 w-full z-50 bg-darkGray text-white">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <!-- Logo -->
        <a href="{{ url('/') }}" class="text-2xl font-bold tracking-tight flex items-center gap-2 h-[35px]">
            GYM<span class="text-red-600">TRACK</span>
        </a>

        <!-- Desktop Menu -->
        <nav class="hidden md:flex items-center space-x-6">
            <ul class="flex space-x-6 items-center">
                @foreach($navItems as $item)
                    @if(!($item['button'] ?? false) && !($item['mobileOnly'] ?? false))
                        <li class="relative group">
                            <a href="{{ route($item['route']) }}" 
                               class="relative font-bold transition-all duration-300 py-1 px-3 rounded {{ $item['active'] ? 'bg-indigo-700' : '' }}">
                                {{ $item['text'] }}
                                <span class="absolute w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full right-0 top-0"></span>
                                <span class="absolute w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full left-0 bottom-0"></span>
                            </a>
                        </li>
                    @endif
                @endforeach
            </ul>
            
            @foreach($navItems as $item)
                @if(($item['button'] ?? false) && !($item['mobileOnly'] ?? false))
                    <a href="{{ route($item['route']) }}" class="{{ $item['class'] }}">
                        {{ $item['text'] }}
                    </a>
                @endif
            @endforeach
        </nav>

        <!-- Mobile Menu Button -->
        <button id="hamburger-button" class="md:hidden text-white focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>
    </div>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden md:hidden bg-indigo-600 w-full">
        <ul class="flex flex-col items-center space-y-4 p-4">
            @foreach($navItems as $item)
                @if(!($item['button'] ?? false))
                    <li class="w-full text-center">
                        <a href="{{ route($item['route']) }}" 
                           class="block w-full py-2 px-3 rounded hover:bg-indigo-500 {{ $item['active'] ? 'bg-indigo-700' : '' }}">
                           {{ $item['text'] }}
                        </a>
                    </li>
                @endif
            @endforeach
            
            @foreach($navItems as $item)
                @if(($item['button'] ?? false))
                    <li class="w-full text-center pt-2">
                        <a href="{{ route($item['route']) }}" 
                           class="inline-block {{ $item['class'] ?? 'bg-amber-300 text-indigo-900 px-4 py-2 rounded-lg font-semibold hover:bg-amber-400 transition' }}">
                           {{ $item['text'] }}
                        </a>
                    </li>
                @endif
            @endforeach
        </ul>
    </div>
</header>

<script>
    // Mobile menu toggle
    document.addEventListener("DOMContentLoaded", function () {
        const hamburgerButton = document.getElementById("hamburger-button");
        const mobileMenu = document.getElementById("mobile-menu");
        const mobileLinks = document.querySelectorAll("#mobile-menu a");

        if (hamburgerButton && mobileMenu) {
            hamburgerButton.addEventListener("click", () => {
                mobileMenu.classList.toggle("hidden");
            });
        }

        mobileLinks.forEach((link) => {
            link.addEventListener("click", () => {
                if (mobileMenu) {
                    mobileMenu.classList.add("hidden");
                }
            });
        });
    });

    // Header scroll effect (optional)
    document.addEventListener("DOMContentLoaded", function () {
        const headerElement = document.getElementById("header");
        
        if (headerElement) {
            let lastScroll = 0;
            
            window.addEventListener("scroll", () => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll <= 0) {
                    headerElement.classList.remove("shadow-lg");
                } else if (currentScroll > lastScroll) {
                    // Scrolling down
                    headerElement.classList.add("shadow-lg");
                } else {
                    // Scrolling up
                    headerElement.classList.add("shadow-lg");
                }
                
                lastScroll = currentScroll;
            });
        }
    });
</script>