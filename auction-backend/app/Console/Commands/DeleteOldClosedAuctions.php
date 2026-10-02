<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Auction;

class DeleteOldClosedAuctions extends Command
{
    protected $signature = 'app:delete-old-closed-auctions';
    protected $description = 'Delete closed auctions older than 2 days that never resulted in an order';

    public function handle()
    {
        $auctions = Auction::where('status', 'closed')
            ->where('end_time', '<=', now()->subDays(2))
            ->whereDoesntHave('order')
            ->get();

        foreach ($auctions as $auction) {
            $auction->bids()->delete();
            $auction->delete();
        }

        $this->info("Deleted {$auctions->count()} old closed auction(s) with no order on record.");
    }
}