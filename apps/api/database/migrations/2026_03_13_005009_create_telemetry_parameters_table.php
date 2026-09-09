<?php

use Dedoc\Scramble\Infer\Scope\Index;
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
        Schema::create('telemetry_parameters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('satellite_id')
                ->constrained('satellites')
                ->onDelete('cascade');
            $table->unsignedTinyInteger('subsystem_id')->references('id')->on('satellite_subsystems')->onDelete('cascade');
            $table->unsignedTinyInteger('parameter_index')->nullable();
            $table->string('parameter_name');
            $table->text('description')->nullable();
            $table->string('unit')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telemetry_parameters');
    }
};
