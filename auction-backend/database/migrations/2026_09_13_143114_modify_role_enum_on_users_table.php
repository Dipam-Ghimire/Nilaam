<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer','seller','buyer_seller','admin') DEFAULT 'buyer'");
    }
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('buyer','seller','admin') DEFAULT 'buyer'");
    }
};
