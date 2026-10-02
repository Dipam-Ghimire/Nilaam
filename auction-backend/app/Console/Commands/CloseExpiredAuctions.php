<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Auction;
use App\Services\OrderService;

class CloseExpiredAuctions extends Command
{
    protected $signature = 'app:close-expired-auctions';
    protected $description = 'Close expired auctions and create orders for the winning bidder';

    public function handle()
    {
        $auctions = Auction::where('status', 'active')
            ->whereNotNull('end_time')
            ->where('end_time', '<=', now())
            ->get();

        foreach ($auctions as $auction) {
            $auction->status = 'closed';
            $auction->save();

            OrderService::createOrderForClosedAuction($auction);
        }

        $this->info("Closed {$auctions->count()} auction(s) and created orders for winners.");
    }
}