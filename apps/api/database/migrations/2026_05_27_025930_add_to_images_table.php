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
        Schema::table('images', function (Blueprint $table) {
            //detectedobj image path
            $table->string('detected_obj_path')->nullable()->after('enhanced_path')->nullable();
            $table->json('detections')->nullable()->after('detected_obj_path')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->dropColumn(['detected_obj_path', 'detections']);
        });
    }
};
