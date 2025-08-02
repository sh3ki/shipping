<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Cell;
use App\Models\Dimension;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('cells')->get();
        return response()->json(['categories' => $categories]);
    }

    public function checkUnique(Request $request)
    {
        $request->validate([
            'name' => 'required|string'
        ]);

        $exists = Category::where('name', $request->input('name'))->exists();
        
        return response()->json([
            'unique' => !$exists
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'color' => 'required|string|max:7',
            'direction' => 'required|string|in:upward,downward,rightward,leftward',
            'description' => 'nullable|string|max:1000',
            'cell_ids' => 'required|array',
            'cell_ids.*' => 'string',
            'map_length' => 'nullable|integer|min:1',
            'map_width' => 'nullable|integer|min:1',
        ]);

        // Get map dimensions
        $layout = Dimension::query()->first();
        $map_length = $validated['map_length'] ?? ($layout ? $layout['map_length'] : 55);
        $map_width = $validated['map_width'] ?? ($layout ? $layout['map_width'] : 40);


        $createdCategory = null;
        $updatedCells = collect();
        DB::transaction(function () use ($validated, $map_length, $map_width, &$createdCategory, &$updatedCells) {
            // Create the category
            $category = Category::create([
                'name' => $validated['name'],
                'color' => $validated['color'],
                'direction' => $validated['direction'],
                'description' => $validated['description'],
            ]);

            // Get the cells to update
            $cells = Cell::whereIn('cell_id', $validated['cell_ids'])->get();

            // Generate names using the new logic
            $cellNames = $this->generateCellNames(
                $validated['cell_ids'],
                $validated['name'],
                $validated['direction']
            );

            // Update each cell with category info and generated names
            foreach ($cells as $cell) {
                $cell->update([
                    'status' => 'selected',
                    'category_id' => $category['primary_id'],
                    'name' => $cellNames[$cell->cell_id],
                ]);
            }
            // Eager load cells_count for broadcast
            $createdCategory = Category::withCount('cells')->find($category->primary_id);
            // Get updated cells for broadcast (only those just updated)
            $updatedCells = Cell::whereIn('cell_id', $validated['cell_ids'])->get();
        });

        // Broadcast the new category and updated cells for real-time update
        if ($createdCategory) {
            event(new \App\Events\CategoryCreated($createdCategory, $updatedCells));
        }

        // Return a redirect so Inertia can handle the response and update the page
        return redirect()->back()->with('success', 'Category created successfully');
    }

    // Update category and cells
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $id . ',primary_id',
            'color' => 'required|string|max:7',
            'direction' => 'required|string|in:upward,downward,rightward,leftward',
            'description' => 'nullable|string|max:1000',
            'cell_ids' => 'required|array',
            'cell_ids.*' => 'string',
            'map_length' => 'nullable|integer|min:1',
            'map_width' => 'nullable|integer|min:1',
        ]);

        $layout = Dimension::query()->first();
        $map_length = $validated['map_length'] ?? ($layout ? $layout['map_length'] : 55);
        $map_width = $validated['map_width'] ?? ($layout ? $layout['map_width'] : 40);

        $updatedCategory = null;
        $updatedCells = collect();
        DB::transaction(function () use ($validated, $id, &$updatedCategory, &$updatedCells) {
            $category = Category::findOrFail($id);
            $category->name = $validated['name'];
            $category->color = $validated['color'];
            $category->direction = $validated['direction'];
            $category->description = $validated['description'];
            $category->save();

            // Get all cells currently assigned to this category
            $previousCells = Cell::where('category_id', $category->primary_id)->get(['*']);
            $selectedCellIds = $validated['cell_ids'];

            // Generate names for selected cells
            $cellNames = $this->generateCellNames(
                $selectedCellIds,
                $validated['name'],
                $validated['direction']
            );

            // Update selected cells
            $selectedCells = Cell::whereIn('cell_id', $selectedCellIds)->get(['*']);
            foreach ($selectedCells as $cell) {
                $cell->status = 'selected';
                $cell->category_id = $category->primary_id;
                $cell->name = $cellNames[$cell->cell_id];
                $cell->save();
            }

            // Unassign cells that were previously assigned but are now unselected
            foreach ($previousCells as $cell) {
                if (!in_array($cell->cell_id, $selectedCellIds)) {
                    $cell->status = 'inactive';
                    $cell->category_id = null;
                    $cell->name = null;
                    $cell->save();
                }
            }

            // Eager load cells_count for broadcast
            $updatedCategory = Category::withCount('cells')->find($category->primary_id);
            // Get all cells for this category (selected + unassigned)
            $updatedCells = Cell::whereIn('cell_id', $selectedCellIds)
                ->orWhere(function($query) use ($category) {
                    $query->where('category_id', $category->primary_id)->where('status', 'inactive');
                })->get();
        });

        // Broadcast the updated category and affected cells for real-time update
        if ($updatedCategory) {
            event(new \App\Events\CategoryUpdated($updatedCategory, $updatedCells));
        }

        return redirect()->back()->with('success', 'Category updated successfully');
    }

    /**
     * Generate cell names based on direction and naming logic
     */
    private function generateCellNames($cellIds, $categoryName, $direction)
    {
        $cellNames = [];
        // Parse cell IDs to get L and W coordinates
        $cellCoordinates = [];
        foreach ($cellIds as $cellId) {
            [$l, $w] = explode('_', $cellId);
            $cellCoordinates[$cellId] = [
                'l' => (int)$l,
                'w' => (int)$w
            ];
        }
        // Group and sort based on direction
        $groups = [];
        switch ($direction) {
            case 'upward':
                foreach ($cellCoordinates as $cellId => $coords) {
                    $groups[$coords['l']][] = ['id' => $cellId, 'l' => $coords['l'], 'w' => $coords['w']];
                }
                ksort($groups);
                foreach ($groups as &$group) {
                    usort($group, function($a, $b) {
                        return $b['w'] - $a['w'];
                    });
                }
                unset($group);
                break;
            case 'downward':
                foreach ($cellCoordinates as $cellId => $coords) {
                    $groups[$coords['l']][] = ['id' => $cellId, 'l' => $coords['l'], 'w' => $coords['w']];
                }
                ksort($groups);
                foreach ($groups as &$group) {
                    usort($group, function($a, $b) {
                        return $a['w'] - $b['w'];
                    });
                }
                unset($group);
                break;
            case 'rightward':
                foreach ($cellCoordinates as $cellId => $coords) {
                    $groups[$coords['w']][] = ['id' => $cellId, 'l' => $coords['l'], 'w' => $coords['w']];
                }
                ksort($groups);
                foreach ($groups as &$group) {
                    usort($group, function($a, $b) {
                        return $a['l'] - $b['l'];
                    });
                }
                unset($group);
                break;
            case 'leftward':
                foreach ($cellCoordinates as $cellId => $coords) {
                    $groups[$coords['w']][] = ['id' => $cellId, 'l' => $coords['l'], 'w' => $coords['w']];
                }
                ksort($groups);
                foreach ($groups as &$group) {
                    usort($group, function($a, $b) {
                        return $b['l'] - $a['l'];
                    });
                }
                unset($group);
                break;
        }
        $categoryCounter = 1;
        foreach ($groups as $group) {
            $txCounter = 1;
            foreach ($group as $cell) {
                $cellNames[$cell['id']] = sprintf('%s%d_T%d', $categoryName, $categoryCounter, $txCounter);
                $txCounter++;
            }
            $categoryCounter++;
        }
        return $cellNames;
    }

    /**
     * Delete a category and update related cells
     */
    public function destroy($id)
    {
        $deletedCategory = null;
        $affectedCells = collect();
        DB::transaction(function () use ($id, &$deletedCategory, &$affectedCells) {
            $category = Category::findOrFail($id);
            // Get affected cells before update
            $affectedCells = Cell::where('category_id', $category->primary_id)->get();
            // Update related cells
            Cell::where('category_id', $category->primary_id)
                ->update([
                    'status' => 'inactive',
                    'category_id' => null,
                    'name' => null,
                ]);
            // Save deleted category info for broadcast
            $deletedCategory = $category;
            // Delete the category
            $category->delete();
        });
        // Broadcast the deleted category and affected cells for real-time update
        if ($deletedCategory) {
            event(new \App\Events\CategoryDeleted($deletedCategory->primary_id, $affectedCells));
        }
        return redirect()->back()->with('success', 'Category deleted successfully');
    }
}
