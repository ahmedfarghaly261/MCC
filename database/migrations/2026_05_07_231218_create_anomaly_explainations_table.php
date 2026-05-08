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
        Schema::create('anomaly_explainations', function (Blueprint $table) {
            $table->id();
            //command log id fk 
            $table->unsignedBigInteger('command_log_id');
            $table->foreign('command_log_id')->references('id')->on('command_logs')->onDelete('cascade');
            $table->json('explaination');
            // telemtry param id fk 
            $table->text('root_cause');
            $table->json('top_3_anomalies');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anomaly_explainations');
    }
};
