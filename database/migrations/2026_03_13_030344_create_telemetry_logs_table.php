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
        Schema::create('telemetry_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('satellite_id')
                ->constrained('satellites')
                ->onDelete('cascade');
            $table->unsignedTinyInteger('subsystem_id')->references('id')->on('satellite_subsystems')->onDelete('cascade');
            $table->unsignedTinyInteger('subsystem_address');
            $table->unsignedTinyInteger('subsystem_mode');
            $table->unsignedBigInteger('subsystem_time')->nullable();
            $table->unsignedInteger('subsystem_rtc')->nullable();
            // The specific field from the ICD Tables (e.g., Index 10 for VBAT)
            // $table->unsignedSmallInteger('parameter_index');
            //parmter name  as fk from tel param table
            $table->foreignId('parameter_id')
                ->constrained('telemetry_parameters')
                ->onDelete('cascade');

            $table->integer('raw_value'); 
            $table->float('converted_value', 10, 4);
            $table->string('unit')->nullable();

            // Timestamp of when the satellite sampled the data
            $table->timestamp('sampled_at')->useCurrent();

            // Metadata for audit 
            $table->timestamp('created_at')->useCurrent();

            $table->index(['subsystem_id', 'sampled_at']);
            $table->index('parameter_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telemetry_logs');
    }
};
