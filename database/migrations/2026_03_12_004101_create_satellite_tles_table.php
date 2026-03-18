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
        Schema::create('satellite_tles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('satellite_id')->constrained('satellites')->onDelete('cascade');
            $table->integer('norad_id')->index();
            $table->string('satellite_name');
            $table->text('line1');
            $table->text('line2');
            $table->string('source');
            $table->timestamp('fetched_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('satellite_tles');
    }
};
