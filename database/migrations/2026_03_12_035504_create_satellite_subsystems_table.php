<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('satellite_subsystems', function (Blueprint $table) {
            $table->id();
            $table->foreignId('satellite_id')
                ->constrained('satellites')
                ->onDelete('cascade');
            $table->string('hex_code', 100)->nullable();
            $table->string('subsystem_name');
            $table->string('status')->default('unknown');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('satellite_subsystems');
    }
};
