<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\MapLayoutController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Staff\DashboardController;
use App\Http\Controllers\Staff\CellInfoController;
use App\Http\Controllers\Admin\CellSelectionController;
use App\Http\Controllers\MessageController;

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
    Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');
    Route::get('admin/shipping_history', function () {
        return Inertia::render('admin/shipping_history');
    })->name('admin.shipping_history');

    // Admin messages page
    Route::get('admin/messages', function () {
        return Inertia::render('admin/messages');
    })->name('admin.messages');

    Route::get('staff/dashboard', [DashboardController::class, 'index'])->name('staff.dashboard');
    // Staff messages page
    Route::get('staff/messages', function () {
        return Inertia::render('staff/messages');
    })->name('staff.messages');
    
    // Staff Cell Info routes
    Route::post('staff/cell-info', [CellInfoController::class, 'store'])->name('staff.cell-info.store');
    Route::put('staff/cell-info/{cell_id}', [CellInfoController::class, 'update'])->name('staff.cell-info.update');
    Route::delete('staff/cell-info/{cell_id}', [CellInfoController::class, 'destroy'])->name('staff.cell-info.destroy');
    Route::post('staff/cell-info/move', [CellInfoController::class, 'move'])->name('staff.cell-info.move');

    // Messaging routes
    Route::prefix('api/messages')->group(function () {
        Route::get('conversations', [MessageController::class, 'index'])->name('messages.conversations');
        Route::get('conversations/{conversation}', [MessageController::class, 'show'])->name('messages.conversation.show');
        Route::post('conversations/{conversation}/messages', [MessageController::class, 'store'])->name('messages.store');
        Route::post('conversations/{conversation}/seen', [MessageController::class, 'markAsSeen'])->name('messages.seen');
        Route::post('conversations/direct', [MessageController::class, 'createDirectConversation'])->name('messages.direct');
        Route::post('conversations/group', [MessageController::class, 'createGroupConversation'])->name('messages.group');
        Route::get('users', [MessageController::class, 'getUsers'])->name('messages.users');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
