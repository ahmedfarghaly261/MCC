<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commands', function (Blueprint $table) {
            $table->id();
            $table->string('name'); 
            $table->unsignedTinyInteger('cmd_id')->unique();
            $table->text('description')->nullable();
            
            // Method A: JSON columns for multiple IDs
            $table->json('allowed_sources'); 
            $table->json('allowed_destinations');
            
            $table->unsignedTinyInteger('expected_data_len')->default(0); 
            $table->boolean('requires_ack')->default(true); 
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commands');
    }
};