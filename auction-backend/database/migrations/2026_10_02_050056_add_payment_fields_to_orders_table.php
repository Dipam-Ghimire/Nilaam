<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending_payment','paid_escrow','shipped','completed','cancelled','refunded') DEFAULT 'pending_payment'");

        Schema::table('orders', function (Blueprint $table) {
            $table->string('khalti_pidx')->nullable();
            $table->string('khalti_transaction_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('escrow_released_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['khalti_pidx', 'khalti_transaction_id', 'paid_at', 'escrow_released_at']);
        });

        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending'");
    }
};