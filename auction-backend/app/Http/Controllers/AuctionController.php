<?php

namespace App\Http\Controllers;

use App\Models\Auction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\OrderService;
use Carbon\Carbon;

class AuctionController extends Controller
{
    /**
     * Shared logic:
     * Close auction and create its order.
     */
    private function closeAuction(Auction $auction): void
    {
        $auction->update([
            'status' => 'closed',
        ]);

        OrderService::createOrderForClosedAuction($auction);
    }

    /**
     * Display active and recently ended auctions.
     */
    public function index(Request $request)
    {
        $now = Carbon::now();

        /*
         * ============================================================
         * 1. PENDING -> ACTIVE
         * ============================================================
         */
        Auction::where('status', 'pending')
            ->whereNotNull('start_time')
            ->whereNotNull('end_time')
            ->where('start_time', '<=', $now)
            ->where('end_time', '>', $now)
            ->update([
                'status' => 'active',
            ]);

        /*
         * ============================================================
         * 2. ACTIVE/PENDING -> CLOSED
         * ============================================================
         */
        $expiring = Auction::whereIn('status', ['pending', 'active'])
            ->whereNotNull('end_time')
            ->where('end_time', '<=', $now)
            ->get();

        foreach ($expiring as $auction) {
            $this->closeAuction($auction);
        }

        /*
         * ============================================================
         * 3. Recently ended cutoff
         * ============================================================
         */
        $recentCutoff = $now->copy()->subHours(48);

        /*
         * ============================================================
         * 4. Get active + recently ended auctions
         * ============================================================
         */
        $auctions = Auction::with([
                'product.images',
                'bids',
            ])
            ->whereHas('product', function ($query) {
                $query->where('status', 'approved');
            })
            ->whereNotNull('end_time')
            ->where(function ($query) use ($now, $recentCutoff) {

                /*
                 * ACTIVE
                 */
                $query->where(function ($active) use ($now) {
                    $active
                        ->where('status', 'active')
                        ->whereNotNull('start_time')
                        ->whereNotNull('end_time')
                        ->where('start_time', '<=', $now)
                        ->where('end_time', '>', $now);
                })

                /*
                 * RECENTLY ENDED
                 */
                ->orWhere(function ($closed) use (
                    $now,
                    $recentCutoff
                ) {
                    $closed
                        ->whereNotNull('end_time')
                        ->whereBetween(
                            'end_time',
                            [$recentCutoff, $now]
                        );
                });
            })
            ->orderByDesc('id')
            ->get();

        /*
         * ============================================================
         * IMPORTANT:
         *
         * Explicitly return UTC ISO timestamps.
         *
         * This prevents JavaScript from guessing the timezone.
         * ============================================================
         */

        $auctions->transform(function ($auction) {

            $auction->start_time = $auction->start_time
                ? Carbon::parse($auction->start_time)
                    ->utc()
                    ->toISOString()
                : null;

            $auction->end_time = $auction->end_time
                ? Carbon::parse($auction->end_time)
                    ->utc()
                    ->toISOString()
                : null;

            return $auction;
        });

        return response()->json($auctions);
    }

    /**
     * Create a new auction.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],

            'type' => [
                'required',
                'string',
                'in:timed',
            ],

            'start_time' => [
                'required',
                'date',
            ],

            'end_time' => [
                'required',
                'date',
                'after:start_time',
            ],

            /*
             * Optional.
             *
             * No maximum duration.
             */
            'duration' => [
                'nullable',
                'integer',
                'min:5',
            ],
        ]);

        $user = $request->user();

        /*
         * ============================================================
         * Make sure product belongs to current seller.
         * ============================================================
         */
        $product = $user->products()
            ->where('id', $validated['product_id'])
            ->first();

        if (!$product) {
            return response()->json([
                'message' =>
                    'You can only start an auction for your own product.'
            ], 403);
        }

        /*
         * Product must be approved.
         */
        if ($product->status !== 'approved') {
            return response()->json([
                'message' =>
                    'This product is not yet approved for auction.'
            ], 403);
        }

        /*
         * Don't allow another pending/active auction
         * for the same product.
         */
        $existingAuction = Auction::where(
                'product_id',
                $validated['product_id']
            )
            ->whereIn('status', ['pending', 'active'])
            ->exists();

        if ($existingAuction) {
            return response()->json([
                'message' =>
                    'This product already has an active or pending auction.'
            ], 422);
        }

        /*
         * ============================================================
         * IMPORTANT TIME FIX
         *
         * Parse the ISO timestamps sent by React.
         *
         * React sends:
         *
         * 2026-10-02T04:08:00.000Z
         *
         * Carbon understands that "Z" means UTC.
         * ============================================================
         */
        $startTime = Carbon::parse(
            $validated['start_time']
        )->utc();

        $endTime = Carbon::parse(
            $validated['end_time']
        )->utc();

        $now = Carbon::now()->utc();

        /*
         * ============================================================
         * Determine status using UTC timestamps.
         * ============================================================
         */

        if ($startTime->gt($now)) {

            // Future auction
            $status = 'pending';

        } elseif (
            $startTime->lte($now) &&
            $endTime->gt($now)
        ) {

            // Currently running
            $status = 'active';

        } else {

            // End time has already passed
            return response()->json([
                'message' =>
                    'Auction end time must be in the future.',
            ], 422);
        }

        /*
         * ============================================================
         * Create auction
         * ============================================================
         */
        $auction = DB::transaction(function () use (
            $validated,
            $status,
            $product,
            $startTime,
            $endTime
        ) {

            return Auction::create([
                'product_id' => $validated['product_id'],

                'type' => $validated['type'],

                'current_bid' => $product->starting_price,

                /*
                 * Store the NORMALIZED UTC Carbon objects,
                 * NOT the original strings.
                 */
                'start_time' => $startTime,

                'end_time' => $endTime,

                'status' => $status,
            ]);
        });

        /*
         * Load relationships.
         */
        $auction->load([
            'product',
            'bids',
        ]);

        /*
         * ============================================================
         * Return explicit UTC timestamps.
         * ============================================================
         */
        return response()->json([
            'message' =>
                'Auction created successfully.',

            'auction' => [
                'id' => $auction->id,
                'product_id' => $auction->product_id,
                'type' => $auction->type,
                'status' => $auction->status,
                'current_bid' => $auction->current_bid,

                'start_time' => $startTime
                    ->copy()
                    ->utc()
                    ->toISOString(),

                'end_time' => $endTime
                    ->copy()
                    ->utc()
                    ->toISOString(),

                'product' => $auction->product,
                'bids' => $auction->bids,
            ],
        ], 201);
    }

    /**
     * Show a single auction.
     */
    public function show($id)
    {
        $auction = Auction::with([
            'product.images',
            'bids.bidder'
        ])->findOrFail($id);

        /*
         * Explicit UTC timestamps.
         */
        $auction->start_time = $auction->start_time
            ? Carbon::parse($auction->start_time)
                ->utc()
                ->toISOString()
            : null;

        $auction->end_time = $auction->end_time
            ? Carbon::parse($auction->end_time)
                ->utc()
                ->toISOString()
            : null;

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
            return response()->json([
                'message' =>
                    'You can only close your own auction.'
            ], 403);
        }

        if ($auction->status === 'closed') {
            return response()->json([
                'message' =>
                    'Auction is already closed.'
            ], 422);
        }

        $this->closeAuction($auction);

        return response()->json([
            'message' =>
                'Auction closed successfully.',

            'auction' => $auction->fresh(),
        ]);
    }
}