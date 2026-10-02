<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Bid;
use App\Models\Order;

class StatsController extends Controller
{
    public function mine(Request $request)
    {
        $user = $request->user();

        $sellerStats = null;
        if (in_array($user->role, ['seller', 'buyer_seller'])) {
            $products = Product::where('seller_id', $user->id)->with('auction')->get();
            $sellerStats = [
                'total_products' => $products->count(),
                'ongoing_auctions' => $products->filter(fn($p) => $p->auction?->status === 'active')->count(),
                'completed_auctions' => $products->filter(fn($p) => $p->auction?->status === 'closed')->count(),
                'total_earned' => Order::where('seller_id', $user->id)->sum('final_price'),
            ];
        }

        $buyerStats = null;
        if (in_array($user->role, ['buyer', 'buyer_seller'])) {
            $myBids = Bid::where('bidder_id', $user->id)->with('auction')->get();
            $auctionIds = $myBids->pluck('auction_id')->unique();
            $outbidCount = 0;
            foreach ($auctionIds as $auctionId) {
                $auction = $myBids->firstWhere('auction_id', $auctionId)->auction;
                if ($auction && $auction->status === 'active') {
                    $highest = Bid::where('auction_id', $auctionId)->orderByDesc('amount')->first();
                    if ($highest && $highest->bidder_id !== $user->id) $outbidCount++;
                }
            }
            $buyerStats = [
                'auctions_participated' => $auctionIds->count(),
                'times_outbid' => $outbidCount,
                'total_spent' => Order::where('buyer_id', $user->id)->sum('final_price'),
                'items_won' => Order::where('buyer_id', $user->id)->count(),
            ];
        }

        return response()->json(['seller' => $sellerStats, 'buyer' => $buyerStats]);
    }
}