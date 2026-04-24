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
        Schema::table('telemetry_logs', function (Blueprint $table) {
            $table->foreignId('command_log_id')->nullable()->constrained('command_logs');
            $table->boolean('is_anomaly')->default(false)->after('converted_value');
            $table->float('anomaly_score', 8, 5)->nullable()->after('is_anomaly');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('telemetry_logs', function (Blueprint $table) {
            $table->dropForeign(['command_log_id']);
            $table->dropColumn('command_log_id');
            $table->dropColumn(['is_anomaly', 'anomaly_score']);
        });
    }
};