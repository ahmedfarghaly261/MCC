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
        Schema::create('command_replies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('command_log_id');
            $table->json('reply_data')->nullable();
            $table->foreign('command_log_id')->references('id')->on('command_logs')->onDelete('cascade');   
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('command_replies');
    }
};
