<?php

namespace App\Notifications;

use App\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AuctionEndedNotification extends Notification
{
    use Queueable;

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
            'type' => 'auction_ended',
            'title' => 'Your auction has ended',
            'message' => '"' .
                $this->auction->product->title .
                '" has ended.',
            'auction_id' => $this->auction->id,
            'product_id' => $this->auction->product_id,
            'url' => '/listings/' . $this->auction->id,
        ];
    }
}