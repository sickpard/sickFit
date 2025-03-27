<?php



namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Mostra il form di login
    public function showLoginForm()
    {
        return view('auth.login');
    }

    // Gestisce il login
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'name' => 'required|string',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            return redirect()->route('home')->with('success', 'Accesso riuscito!');
        }

        return back()->withErrors(['name' => 'Credenziali non valide.']);
    }

    // Logout
    public function logout()
    {
        Auth::logout();
        return redirect()->route('home')->with('success', 'Sei stato disconnesso.');
    }
}
