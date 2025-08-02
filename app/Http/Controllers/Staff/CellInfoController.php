<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Cell_Info;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CellInfoController extends Controller
{
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
            return response()->json(['error' => 'Cell information already exists'], 422);
        }

        $cellInfo = Cell_Info::create($validated);

        return response()->json(['success' => true, 'data' => $cellInfo]);
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

        return response()->json(['success' => true, 'data' => $cellInfo]);
    }

    public function destroy($cell_id)
    {
        $cellInfo = Cell_Info::where('cell_id', $cell_id)->firstOrFail();
        $cellInfo->delete();

        return response()->json(['success' => true]);
    }
}
