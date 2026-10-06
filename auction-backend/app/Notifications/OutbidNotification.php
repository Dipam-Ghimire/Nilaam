<?php

namespace App\Notifications;

use App\Models\Auction;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OutbidNotification extends Notification
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
            'type' => 'outbid',
            'title' => 'You have been outbid',
            'message' => 'Someone placed a higher bid on "' .
                $this->auction->product->title . '".',
            'auction_id' => $this->auction->id,
            'product_id' => $this->auction->product_id,
            'url' => '/listings/' . $this->auction->id,
        ];
    }
}