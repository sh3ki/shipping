<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'role' => 'admin',
            ],
            [
                'name' => 'Admin User 1',
                'email' => 'admin1@example.com',
                'role' => 'admin',
            ],
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ],
            
            [
                'name' => 'Test User 1',
                'email' => 'test1@example.com',
            ],
        ];

        foreach ($users as $userData) {
            User::factory()->create($userData);
        }
        // Call other seeders in the desired order
        $this->call([
            DimensionSeeder::class,
            CategorySeeder::class,
            CellSeeder::class,
        ]);
    }
}
