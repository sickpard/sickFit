# Creare un controller

## questo non ho veramente ben capito a cosa serva, ma collega model e repository (la repo elabora proprio i dati)
## per crearlo ci sono due modi:
**Metodo 1:** 
```bash
php artisan make:controller WorkoutController
```

**Metodo 2:**
```bash
php artisan make:controller WorkoutController --resource --model=Workout
```

Non ho capito molto bene la differenza lol, a logica il secondo estende gia in automatico il model
