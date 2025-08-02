<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->bigIncrements('primary_id');
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->string('color');
            $table->enum('direction', ['upward', 'downward', 'rightward', 'leftward']);
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
