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
        Schema::table('command_logs', function (Blueprint $table) {

            $table->integer('decoding_retry_count')->default(0);
            $table->timestamp('last_decoding_retry_at')->nullable();
            $table->float('anomaly_score')->nullable();
            $table->boolean('is_anomaly')->default(false);
            $table->timestamp('processed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('command_logs', function (Blueprint $table) {
          $table->dropColumn(['decoding_retry_count', 'last_decoding_retry_at', 'anomaly_score', 'is_anomaly']);
        });
    }
};
