<?php

namespace App\Services;

use App\Models\Auction;
use App\Models\Order;

class OrderService
{
    public static function createOrderForClosedAuction(Auction $auction): ?Order
    {
        if (Order::where('auction_id', $auction->id)->exists()) {
            return null;
        }

        $winningBid = $auction->bids()->orderByDesc('amount')->first();

        if (!$winningBid || !$winningBid->bidder_id) {
            return null;
        }

        return Order::create([
            'auction_id' => $auction->id,
            'buyer_id' => $winningBid->bidder_id,
            'seller_id' => $auction->product->seller_id,
            'final_price' => $winningBid->amount,
            'status' => 'pending_payment',
        ]);
    }
}