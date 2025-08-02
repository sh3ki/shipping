<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dimension;
use App\Models\Category;
use App\Models\Cell;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Events\DimensionsUpdated;

class MapLayoutController extends Controller
{
    public function index()
    {
        $layout = Dimension::first();
        $categories = Category::withCount('cells')->get();
        $cells = Cell::all();
        
        return Inertia::render('admin/map_layout', [
            'map_length' => $layout ? $layout['map_length'] : null,
            'map_width' => $layout ? $layout['map_width'] : null,
            'categories' => $categories,
            'cells' => $cells,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'map_length' => 'required|integer|min:1',
            'map_width' => 'required|integer|min:1',
        ]);
        $layout = Dimension::first();
        $map_length = (int)$data['map_length'];
        $map_width = (int)$data['map_width'];

        $dimensionsChanged = false;

        if (!$layout) {
            // No dimension record yet, create and initialize all cells
            Dimension::create($data);
            $cells = [];
            for ($l = 1; $l <= $map_length; $l++) {
                for ($w = 1; $w <= $map_width; $w++) {
                    $cells[] = [
                        'cell_id' => $l . '_' . $w,
                        'status' => 'inactive',
                        'category_id' => null,
                        'name' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            \Illuminate\Support\Facades\DB::table('cells')->insert($cells);
            $dimensionsChanged = true;
        } else {
            // Update dimension only if changed
            $old_length = (int)$layout->map_length;
            $old_width = (int)$layout->map_width;
            if ($old_length !== $map_length || $old_width !== $map_width) {
                $layout->update($data);
                $dimensionsChanged = true;
            }

            // Add new cells if dimensions increased
            $new_cells = [];
            // Add new rows if map_length increased
            if ($map_length > $old_length) {
                for ($l = $old_length + 1; $l <= $map_length; $l++) {
                    for ($w = 1; $w <= $map_width; $w++) {
                        $cell_id = $l . '_' . $w;
                        // Only add if not exists
                        if (!Cell::where('cell_id', $cell_id)->exists()) {
                            $new_cells[] = [
                                'cell_id' => $cell_id,
                                'status' => 'inactive',
                                'category_id' => null,
                                'name' => null,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                        }
                    }
                }
            }
            // Add new columns if map_width increased
            if ($map_width > $old_width) {
                for ($l = 1; $l <= min($old_length, $map_length); $l++) {
                    for ($w = $old_width + 1; $w <= $map_width; $w++) {
                        $cell_id = $l . '_' . $w;
                        if (!Cell::where('cell_id', $cell_id)->exists()) {
                            $new_cells[] = [
                                'cell_id' => $cell_id,
                                'status' => 'inactive',
                                'category_id' => null,
                                'name' => null,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                        }
                    }
                }
            }
            if (!empty($new_cells)) {
                \Illuminate\Support\Facades\DB::table('cells')->insert($new_cells);
            }

            // Remove cells if dimensions decreased
            $cells_to_delete = [];
            // Remove rows if map_length decreased
            if ($map_length < $old_length) {
                $cells_to_delete = array_merge($cells_to_delete,
                    Cell::whereRaw('CAST(SUBSTRING_INDEX(cell_id, "_", 1) AS UNSIGNED) > ?', [$map_length])->pluck('cell_id')->toArray()
                );
            }
            // Remove columns if map_width decreased
            if ($map_width < $old_width) {
                $cells_to_delete = array_merge($cells_to_delete,
                    Cell::whereRaw('CAST(SUBSTRING_INDEX(cell_id, "_", -1) AS UNSIGNED) > ?', [$map_width])->pluck('cell_id')->toArray()
                );
            }
            if (!empty($cells_to_delete)) {
                Cell::whereIn('cell_id', $cells_to_delete)->delete();
            }
        }

        // Broadcast only if dimensions changed
        if ($dimensionsChanged) {
            event(new DimensionsUpdated($map_length, $map_width));
        }

        return redirect()->route('admin.map_layout')->with('success', 'Map layout saved and cells updated.');
    }
}
