<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\OrderService;

class AuctionController extends Controller
{
    /**
     * Shared logic: transition one auction to closed and create its order.
     * Called from every place an auction can close, so order creation
     * never gets skipped.
     */
    private function closeAuction(Auction $auction): void
    {
        $auction->update(['status' => 'closed']);
        OrderService::createOrderForClosedAuction($auction);
    }

    /**
     * Display active and recently ended auctions.
     */
    public function index(Request $request)
    {
        $now = now();

        // 1. Pending -> Active
        Auction::where('status', 'pending')
            ->whereNotNull('start_time')
            ->whereNotNull('end_time')
            ->where('start_time', '<=', $now)
            ->where('end_time', '>', $now)
            ->update(['status' => 'active']);

        // 2. Pending/Active -> Closed (looped, not bulk, so each one creates its order)
        $expiring = Auction::whereIn('status', ['pending', 'active'])
            ->whereNotNull('end_time')
            ->where('end_time', '<=', $now)
            ->get();

        foreach ($expiring as $auction) {
            $this->closeAuction($auction);
        }

        // 3. Recently ended cutoff
        $recentCutoff = $now->copy()->subHours(48);

        // 4. Active + recently ended auctions, approved products only
        $auctions = Auction::with(['product.images', 'bids'])
            ->whereHas('product', fn($q) => $q->where('status', 'approved'))
            ->whereNotNull('end_time')
            ->where(function ($query) use ($now, $recentCutoff) {
                $query->where(function ($active) use ($now) {
                    $active->where('status', 'active')
                        ->whereNotNull('start_time')
                        ->whereNotNull('end_time')
                        ->where('start_time', '<=', $now)
                        ->where('end_time', '>', $now);
                });

                $query->orWhere(function ($closed) use ($now, $recentCutoff) {
                    $closed->whereNotNull('end_time')
                        ->whereBetween('end_time', [$recentCutoff, $now]);
                });
            })
            ->orderByDesc('id')
            ->get();

        return response()->json($auctions);
    }

    /**
     * Create a new auction.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'type' => ['required', 'string', 'in:timed'],
            'start_time' => ['required', 'date'],
            'end_time' => ['required', 'date', 'after:start_time'],
        ]);

        $user = $request->user();

        $product = $user->products()
            ->where('id', $validated['product_id'])
            ->first();

        if (!$product) {
            return response()->json(['message' => 'You can only start an auction for your own product.'], 403);
        }

        if ($product->status !== 'approved') {
            return response()->json(['message' => 'This product is not yet approved for auction.'], 403);
        }

        $existingAuction = Auction::where('product_id', $validated['product_id'])
            ->whereIn('status', ['pending', 'active'])
            ->exists();

        if ($existingAuction) {
            return response()->json(['message' => 'This product already has an active or pending auction.'], 422);
        }

        $startTime = \Carbon\Carbon::parse($validated['start_time']);
        $endTime = \Carbon\Carbon::parse($validated['end_time']);
        $now = now();

        if ($startTime->gt($now)) {
            $status = 'pending';
        } elseif ($endTime->gt($now)) {
            $status = 'active';
        } else {
            return response()->json(['message' => 'Auction end time must be in the future.'], 422);
        }

        $auction = DB::transaction(function () use ($validated, $status, $product) {
            return Auction::create([
                'product_id' => $validated['product_id'],
                'type' => $validated['type'],
                'current_bid' => $product->starting_price,
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'status' => $status,
            ]);
        });

        $auction->load(['product', 'bids']);

        return response()->json(['message' => 'Auction created successfully.', 'auction' => $auction], 201);
    }

    /**
     * Show a single auction.
     */
    public function show($id)
    {
        $auction = Auction::with(['product.images', 'bids.bidder'])->findOrFail($id);

        return response()->json($auction);
    }

    /**
     * Close an auction manually.
     */
    public function close($id, Request $request)
    {
        $auction = Auction::findOrFail($id);
        $user = $request->user();

        $product = $user->products()
            ->where('id', $auction->product_id)
            ->first();

        if (!$product) {
            return response()->json(['message' => 'You can only close your own auction.'], 403);
        }

        if ($auction->status === 'closed') {
            return response()->json(['message' => 'Auction is already closed.'], 422);
        }

        $this->closeAuction($auction);

        return response()->json(['message' => 'Auction closed successfully.', 'auction' => $auction->fresh()]);
    }
}