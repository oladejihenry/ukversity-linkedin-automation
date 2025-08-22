<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        //create two users with the following credentials
        //henryoladeji2007@gmail.com: love2020
        //raman@gmail.com: raman  

        User::factory()->create([
            'name' => 'Henry Oladeji',
            'email' => 'henryoladeji2007@gmail.com',
            'password' => Hash::make('love2020'),
        ]);

        User::factory()->create([
            'name' => 'Raman',
            'email' => 'raman@gmail.com',
            'password' => Hash::make('raman'),
        ]);
    }
}
