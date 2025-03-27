# Creare una tabella del db

## 1. Crea una migration da CLI
`php artisan make:migration 'nome_tabella'`


## 2. Modifica la migration
La migration verrà creata in `database\migrations`, aggiungi i dati che preferisci. **Stai molto attento** perché per annullarla è complicato.

## 3. Eliminare una migration subito dopo averla fatta
```bash
php artisan migrate:rollback
```

## 4. Aggiungi una colonna al db
```bash
php artisan make:migration add_role_to_users_table --table=users
```

## Esempio per aggiungere 'role' alla tabella 'users':
```bash
public function up(): void{
    Schema::table('users', function (Blueprint $table) {
        $table->string('role')->after('password'); // Aggiungi la colonna 'role' dopo 'password'
    });
}

public function down(): void{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('role');
    });
}
```

