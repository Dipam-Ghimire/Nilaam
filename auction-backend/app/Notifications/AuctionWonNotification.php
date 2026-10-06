<?php

namespace App\Notifications;

use App\Models\Auction;

class AuctionWonNotification extends Notification
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
            'type' => 'auction_won',
            'title' => 'Congratulations! You won the auction',
            'message' => 'You won "' .
                $this->auction->product->title .
                '". Your order is now ready for payment.',
            'auction_id' => $this->auction->id,
            'product_id' => $this->auction->product_id,
            'url' => '/my-orders',
        ];
    }
}