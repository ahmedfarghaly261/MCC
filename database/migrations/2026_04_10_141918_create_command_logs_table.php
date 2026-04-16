<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('command_logs', function (Blueprint $table) {
            $table->id();
            // Link to the command definition
            $table->foreignId('command_id')->constrained('commands');
            
            // Subsystem addresses
            $table->string('dest_address'); // e.g., 0xA2 for EPS
            $table->string('src_address')->default('0xB0'); // GCS
            
            // The actual payload sent
            $table->text('raw_binary_sent'); 
            
            // Status Tracking
            // pending: sent but no reply yet
            // acked: received 0x02 
            // nacked: received 0x03 
            // timeout: no reply within 100ms 
            // $table->enum('status', ['pending', 'telemetry_received', 'acked', 'nacked', 'timeout'])->default('pending');
            $table->string('status', 50);
            // Timing details for performance analysis
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamp('replied_at')->nullable();
            $table->float('response_time_ms')->nullable(); // Should be < 50ms

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('command_logs');
    }
};
