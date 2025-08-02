php<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cells_info', function (Blueprint $table) {
            $table->bigIncrements('primary_id');
            $table->string('cell_id');
            $table->enum('shipping_line', ['BENLINE - HARBOUR LINK ', 'BENLINE - MBF CARPENTER ', 'BLPL ', 'CONCORDE ', 'COSCO ', 'ENTERPHIL ', 'ELAN INTERNATIONAL ', 'EW INTERNATIONAL ', 'KYOWA ', 'LANCER ', 'MSC ', 'NAMSUNG ', 'NEW ZEALAND ', 'OOCL ', 'PENEX / ORCHID ', 'RCL ', 'SAMUDERA / M STAR ', 'SEAFRONT ', 'SWIRE SHIPPING PTE LTD ', 'TAEWOONG'])->nullable()->default(null);
            $table->enum('size', ['1 x 40', '1 x 20'])->nullable()->default(null);
            $table->enum('type', ['DRY HIGH CUBE', 'DRY STANDARD', 'REEFER', 'FLAT RACK', 'OPEN TOP'])->nullable()->default(null);
            $table->enum('cell_status', ['Available', 'For Repair', 'Pending Approval EOR', 'Damaged'])->nullable()->default('Available');
            $table->timestamps();
            $table->foreign('cell_id')->references('cell_id')->on('cells');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('cells_info');
    }
};
