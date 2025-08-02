<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'A',
                'description' => null,
                'color' => '#24eb31',
                'direction' => 'downward',
            ],
            [
                'name' => 'B',
                'description' => null,
                'color' => '#eb242e',
                'direction' => 'upward',
            ],
            [
                'name' => 'C',
                'description' => null,
                'color' => '#ebd024',
                'direction' => 'downward',
            ],
            [
                'name' => 'D',
                'description' => null,
                'color' => '#2563eb',
                'direction' => 'upward',
            ],
            [
                'name' => 'E',
                'description' => null,
                'color' => '#eb8424',
                'direction' => 'leftward',
            ],
            [
                'name' => 'F',
                'description' => null,
                'color' => '#b0b0b0',
                'direction' => 'upward',
            ],
            [
                'name' => 'G',
                'description' => null,
                'color' => '#eb24ac',
                'direction' => 'rightward',
            ],
            [
                'name' => 'H',
                'description' => null,
                'color' => '#707070',
                'direction' => 'leftward',
            ],
            [
                'name' => 'XB',
                'description' => null,
                'color' => '#9b24eb',
                'direction' => 'leftward',
            ],
            [
                'name' => 'XD',
                'description' => null,
                'color' => '#9b24eb',
                'direction' => 'leftward',
            ],
            [
                'name' => 'XF',
                'description' => null,
                'color' => '#9b24eb',
                'direction' => 'leftward',
            ],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert($category);
        }
    }
}
