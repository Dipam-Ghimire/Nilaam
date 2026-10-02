<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function myOrders(Request $request)
    {
        return response()->json(
            Order::with('auction.product.images', 'seller')
                ->where('buyer_id', $request->user()->id)
                ->latest()->get()
        );
    }

    public function mySales(Request $request)
    {
        return response()->json(
            Order::with('auction.product.images', 'buyer')
                ->where('seller_id', $request->user()->id)
                ->latest()->get()
        );
    }

    public function show(Request $request, $id)
    {
        $order = Order::with('auction.product.images', 'buyer', 'seller')->find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        if ($order->buyer_id !== $request->user()->id && $order->seller_id !== $request->user()->id) {
            return response()->json(['message' => 'You are not authorized to view this order'], 403);
        }
        return response()->json($order);
    }
}