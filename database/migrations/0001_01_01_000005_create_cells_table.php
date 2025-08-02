php<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cells', function (Blueprint $table) {
            $table->bigIncrements('primary_id');
            $table->string('cell_id')->unique();
            $table->enum('status', ['inactive', 'selected'])->default('inactive');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('name')->nullable();
            $table->timestamps();
            $table->foreign('category_id')->references('primary_id')->on('categories')->onDelete('set null');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('cells');
    }
};
