<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Auction;
use App\Events\BidPlaced;

class BidController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'auction_id' => 'required|exists:auctions,id',
            'amount' => 'required|numeric|min:0.01',
        ]);

        $user = $request->user();

        if ($user->role === 'seller') {
            return response()->json([
                'message' => 'Sellers cannot place bids'
            ], 403);
        }

        if ($user->kyc_status !== 'verified') {
            return response()->json([
                'message' => 'You must complete KYC verification before bidding'
            ], 403);
        }

        $bid = DB::transaction(function () use ($request, $user) {

            $auction = Auction::with('product')
                ->where('id', $request->auction_id)
                ->lockForUpdate()
                ->first();

            if (!$auction) {
                return response()->json([
                    'message' => 'Auction not found'
                ], 404);
            }

            if (!$auction->product) {
                return response()->json([
                    'message' => 'Auction product not found'
                ], 404);
            }

            if ($auction->product->seller_id === $user->id) {
                return response()->json([
                    'message' => 'You cannot bid on your own auction'
                ], 403);
            }

            if (
                $auction->end_time &&
                now()->greaterThanOrEqualTo($auction->end_time)
            ) {
                $auction->update([
                    'status' => 'closed'
                ]);

                return response()->json([
                    'message' => 'This auction has already ended'
                ], 400);
            }

            if ($auction->status !== 'active') {
                return response()->json([
                    'message' => 'Auction is not open for bidding'
                ], 400);
            }

            $highestBid = $auction->bids()
                ->orderBy('amount', 'desc')
                ->first();

            if (
                $highestBid &&
                $highestBid->bidder_id === $user->id
            ) {
                return response()->json([
                    'message' => 'You are already the highest bidder'
                ], 400);
            }

            if (
                $highestBid &&
                $request->amount <= $highestBid->amount
            ) {
                return response()->json([
                    'message' => 'Bid amount must be higher than the current highest bid'
                ], 400);
            }

            $newBid = $auction->bids()->create([
                'bidder_id' => $user->id,
                'amount' => $request->amount,
            ]);

            $auction->update([
                'current_bid' => $request->amount
            ]);

            return $newBid;
        });

        if ($bid instanceof \Illuminate\Http\JsonResponse) {
            return $bid;
        }

        /*
         * Load the bidder relationship before broadcasting.
         * Your Bid model uses bidder(), not user().
         */
        $bid->load('bidder');

        broadcast(new BidPlaced($bid));

        return response()->json($bid, 201);
    }
}