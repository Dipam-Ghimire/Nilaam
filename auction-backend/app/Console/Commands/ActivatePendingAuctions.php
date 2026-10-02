<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Auction;

class ActivatePendingAuctions extends Command
{
    protected $signature = 'app:activate-pending-auctions';
    protected $description = 'Activate auctions whose scheduled start time has arrived';

    public function handle()
    {
        $count = Auction::where('status', 'pending')
            ->where('start_time', '<=', now())
            ->update(['status' => 'active']);

        $this->info("Activated {$count} auction(s).");
    }
}