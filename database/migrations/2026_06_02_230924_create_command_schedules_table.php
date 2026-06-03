<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('command_schedules', function (Blueprint $table) {
            $table->id();
            $table->uuid('batch_uuid')->nullable();
            $table->string('macro_name');

            $table->unsignedBigInteger('command_id');
            $table->integer('dest_address');
            $table->json('data');

            $table->timestamp('execute_at');
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->foreign('command_id')->references('id')->on('commands')->onDelete('cascade');
            $table->index(['status', 'execute_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('command_schedules');
    }
};
