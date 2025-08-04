<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Cell_Info;
use Illuminate\Http\Request;
use App\Events\CellsInformationCreated;
use App\Events\CellsInformationUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Events\CellsInformationDeleted;

class CellInfoController extends Controller

{
    /**
     * Move cell info from one cell to another.
     * Only allows moving to a cell that does not have cell info yet.
     */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cell_id' => 'required|string|exists:cells,cell_id',
            'shipping_line' => 'required|string',
            'size' => 'required|string|in:1 x 40,1 x 20',
            'type' => 'required|string|in:DRY HIGH CUBE,DRY STANDARD,REEFER,FLAT RACK,OPEN TOP',
            'cell_status' => 'string|in:Available,For Repair,Pending Approval EOR,Damaged',
        ]);

        // Check if cell info already exists
        $existingCellInfo = Cell_Info::where('cell_id', $validated['cell_id'])->first();
        
        if ($existingCellInfo) {
            return redirect()->back()->withErrors(['error' => 'Cell information already exists'])->withInput();
        }

        $cellInfo = Cell_Info::create($validated);

        // Broadcast event
        event(new CellsInformationCreated($cellInfo));

        return redirect()->back()->with('success', 'Cell information saved successfully.');
    }

    public function update(Request $request, $cell_id)
    {
        $validated = $request->validate([
            'shipping_line' => 'required|string',
            'size' => 'required|string|in:1 x 40,1 x 20',
            'type' => 'required|string|in:DRY HIGH CUBE,DRY STANDARD,REEFER,FLAT RACK,OPEN TOP',
            'cell_status' => 'string|in:Available,For Repair,Pending Approval EOR,Damaged',
        ]);

        $cellInfo = Cell_Info::where('cell_id', $cell_id)->firstOrFail();
        $cellInfo->update($validated);

        // Broadcast event
        event(new CellsInformationUpdated($cellInfo));

        return redirect()->back()->with('success', 'Cell information updated successfully.');
    }

    public function destroy($cell_id)
    {
        $cellInfo = Cell_Info::where('cell_id', $cell_id)->firstOrFail();
        $cellInfo->delete();
        // Broadcast deleted event
        event(new CellsInformationDeleted($cell_id));

        // If Inertia request, return a redirect with flash data
        if (request()->hasHeader('X-Inertia')) {
            return redirect()->back()->with('deleted_cell_id', $cell_id);
        }
        // Otherwise, return JSON for API
        return response()->json(['success' => true]);
    }

        public function move(Request $request)
    {
        $validated = $request->validate([
            'from_cell_id' => 'required|string|exists:cells_info,cell_id',
            'to_cell_id' => [
                'required',
                'string',
                'exists:cells,cell_id',
                // Ensure no info exists for the target cell
                function ($attribute, $value, $fail) {
                    if (Cell_Info::where('cell_id', $value)->exists()) {
                        $fail('Target cell already has information.');
                    }
                },
            ],
        ]);

        $fromCellInfo = Cell_Info::where('cell_id', $validated['from_cell_id'])->firstOrFail();

        // Save old cell id for broadcast
        $oldCellId = $fromCellInfo->cell_id;
        $data = $fromCellInfo->toArray();
        unset($data['primary_id'], $data['cell_id'], $data['created_at'], $data['updated_at']);
        $fromCellInfo->delete();

        // Create new Cell_Info for the destination cell
        $newCellInfo = Cell_Info::create(array_merge($data, [
            'cell_id' => $validated['to_cell_id'],
        ]));

        // Broadcast event for update
        event(new CellsInformationUpdated($newCellInfo));
        // Broadcast deleted event for old cell id
        event(new CellsInformationDeleted($oldCellId));

        // If Inertia request, return a redirect with flash data
        if ($request->hasHeader('X-Inertia')) {
            return redirect()->back()->with([
                'moved_cell_info' => $newCellInfo,
                'moved_from_cell_id' => $oldCellId,
            ]);
        }
        // Otherwise, return JSON for API
        return response()->json(['success' => true, 'cellInfo' => $newCellInfo]);
    }
}
