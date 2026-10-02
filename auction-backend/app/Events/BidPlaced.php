<?php

namespace App\Events;

use App\Models\Bid;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BidPlaced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $bid;

    public function __construct(Bid $bid)
    {
        $this->bid = $bid;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('auction.' . $this->bid->auction_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->bid->id,
            'auction_id' => $this->bid->auction_id,
            'bidder_id' => $this->bid->bidder_id,
            'amount' => $this->bid->amount,
            'created_at' => $this->bid->created_at,
        ];
    }
}