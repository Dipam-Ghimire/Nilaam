<?php

namespace App\Notifications;

use App\Models\Auction;

class AuctionLostNotification extends Notification
{
    public function __construct(
        public Auction $auction
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'auction_lost',
            'title' => 'Auction ended',
            'message' => 'You did not win "' .
                $this->auction->product->title .
                '".',
            'auction_id' => $this->auction->id,
            'product_id' => $this->auction->product_id,
            'url' => '/listings/' . $this->auction->id,
        ];
    }
}