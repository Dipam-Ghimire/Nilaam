<?php

namespace App\Console\Commands;

use App\Models\Auction;
use Illuminate\Console\Command;

class CleanupOldAuctions extends Command
{
    protected $signature =
        'auctions:cleanup-old {--hours=48}';

    protected $description =
        'Delete auctions that ended more than the configured number of hours ago';

    public function handle()
    {
        $hours = (int) $this->option(
            'hours'
        );

        $cutoff = now()->subHours(
            $hours
        );

        $auctions = Auction::whereNotNull(
                'end_time'
            )
            ->where(
                'end_time',
                '<',
                $cutoff
            )
            ->get();

        $count = 0;

        foreach ($auctions as $auction) {

            /*
             * If your Auction model has a bids()
             * relationship and bids do NOT have
             * cascade delete, delete bids first.
             */
            if (method_exists(
                $auction,
                'bids'
            )) {
                $auction->bids()->delete();
            }

            $auction->delete();

            $count++;
        }

        $this->info(
            "Deleted {$count} old auction(s)."
        );

        return Command::SUCCESS;
    }
}