<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\MapLayoutController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Staff\DashboardController;
use App\Http\Controllers\Staff\CellInfoController;
use App\Http\Controllers\Admin\CellSelectionController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('admin/dashboard', function () {
        return Inertia::render('admin/dashboard');
    })->name('admin.dashboard');

    Route::get('admin/map_layout', [MapLayoutController::class, 'index'])->name('admin.map_layout');
    Route::post('admin/map_layout', [MapLayoutController::class, 'store'])->name('admin.map_layout.save');
    Route::get('admin/categories', [CategoryController::class, 'index'])->name('admin.categories.index');
    Route::post('admin/categories/check-unique', [CategoryController::class, 'checkUnique'])->name('admin.categories.check_unique');
    Route::post('admin/categories', [CategoryController::class, 'store'])->name('admin.categories.store');
    Route::post('admin/categories/{id}', [CategoryController::class, 'update'])->name('admin.categories.update');
    // Category management routes
    Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');
    Route::get('staff/dashboard', [DashboardController::class, 'index'])->name('staff.dashboard');
    
    // Staff Cell Info routes
    Route::post('staff/cell-info', [CellInfoController::class, 'store'])->name('staff.cell-info.store');
    Route::put('staff/cell-info/{cell_id}', [CellInfoController::class, 'update'])->name('staff.cell-info.update');
    Route::delete('staff/cell-info/{cell_id}', [CellInfoController::class, 'destroy'])->name('staff.cell-info.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
