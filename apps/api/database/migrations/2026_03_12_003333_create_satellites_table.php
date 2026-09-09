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
        Schema::create('satellites', function (Blueprint $table) {
            $table->id();
            $table->integer('norad_id')->unique()->index(); // Unique ID from CelesTrak
            $table->string('name');
            $table->string('cospar_id')->nullable(); // International designator
            $table->string('owner_country')->default('Egypt'); // For EgSA tracking
            $table->string('status')->default('active'); // active, decayed, unknown
            $table->date('launch_date')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('satellites');
    }
};
