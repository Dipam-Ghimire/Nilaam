<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\User;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\Order;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_users' => User::count(),
            'total_sellers' => User::where('role', 'seller')->count(),
            'pending_products' => Product::where('status', 'pending')->count(),
            'approved_products' => Product::where('status', 'approved')->count(),
            'active_auctions' => Auction::where('status', 'active')->count(),
            'total_bids' => Bid::count(),
            'pending_kyc' => User::where('kyc_status', 'pending')->count(),
        ]);
    }
    public function marketplaceStats()
{
    return response()->json([
        'registered_users' => \App\Models\User::count(),
    ]);
}

    public function pendingProducts()
    {
        return response()->json(Product::with('seller', 'images')->where('status', 'pending')->get());
    }

    public function approveProduct($id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);
        $product->update(['status' => 'approved']);
        return response()->json(['message' => 'Product approved']);
    }

    public function rejectProduct($id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Not found'], 404);
        $product->update(['status' => 'rejected']);
        return response()->json(['message' => 'Product rejected']);
    }

    public function pendingKyc()
    {
        return response()->json(User::where('kyc_status', 'pending')->get());
    }

    public function verifyKyc($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['message' => 'Not found'], 404);
        $user->update(['kyc_status' => 'verified']);
        return response()->json(['message' => 'KYC verified']);
    }

    public function rejectKyc($id)
    {
        $user = User::find($id);
        if (!$user) return response()->json(['message' => 'Not found'], 404);
        $user->update(['kyc_status' => 'rejected']);
        return response()->json(['message' => 'KYC rejected']);
    }
    public function releaseEscrow($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        if ($order->status !== 'paid_escrow') {
            return response()->json(['message' => 'Order is not currently held in escrow'], 400);
        }
        $order->update(['status' => 'completed', 'escrow_released_at' => now()]);
        return response()->json(['message' => 'Escrow released by admin', 'order' => $order]);
    }
}