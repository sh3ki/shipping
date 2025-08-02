<?php
namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Dimension;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $layout = Dimension::first();
        $categories = \App\Models\Category::withCount('cells')->get();
        $cells = \App\Models\Cell::all();
        $cellsInfo = \App\Models\Cell_Info::all();
        
        return Inertia::render('staff/dashboard', [
            'map_length' => $layout ? $layout['map_length'] : null,
            'map_width' => $layout ? $layout['map_width'] : null,
            'categories' => $categories,
            'cells' => $cells,
            'cellsInfo' => $cellsInfo,
        ]);
    }
}
