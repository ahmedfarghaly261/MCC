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
        Schema::create('telemetry_frames', function (Blueprint $table) {
            $table->id();
            $table->integer('norad_id')->index()->default(39444); // Links to your Satellite
            $table->integer('frame_index'); // The 'cursor' from Python
            $table->string('captured_at'); // Original timestamp from dataset
            $table->string('station_name'); //
            $table->string('grid_locator'); //
            $table->string('frequency_info')->nullable(); //
            $table->text('hex_frame'); // The raw telemetry data
            $table->integer('byte_count'); //
            $table->timestamp('streamed_at'); // When it hit your Laravel app
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telemetry_frames');
    }
};
