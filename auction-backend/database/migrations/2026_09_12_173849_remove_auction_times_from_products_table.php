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
    Schema::table('products', function (Blueprint $table) {
        $table->dropColumn(['start_time', 'end_time']);
    });
}
public function down(): void
{
    Schema::table('products', function (Blueprint $table) {
        $table->timestamp('start_time')->nullable();
        $table->timestamp('end_time')->nullable();
    });
}
};
