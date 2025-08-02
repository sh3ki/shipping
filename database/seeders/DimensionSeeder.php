<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DimensionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Insert or update the dimension
        DB::table('dimensions')->updateOrInsert(
            ['id' => 1],
            [
                'map_length' => 60,
                'map_width' => 43,
            ]
        );

        // Check if cells table is empty
        if (DB::table('cells')->count() === 0) {
            $cells = [];
            $now = Carbon::now();
            for ($l = 1; $l <= 60; $l++) {
                for ($w = 1; $w <= 43; $w++) {
                    $cells[] = [
                        'cell_id' => $l . '_' . $w,
                        'status' => 'inactive',
                        'category_id' => null,
                        'name' => null,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
            DB::table('cells')->insert($cells);
        }
    }
}
