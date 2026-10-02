<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Order;

class PaymentController extends Controller
{
    public function initiate(Request $request, $id)
    {
        $order = Order::with('auction.product')->find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'You are not authorized to pay for this order'], 403);
        }
        if ($order->status !== 'pending_payment') {
            return response()->json(['message' => 'This order is not awaiting payment'], 400);
        }

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        $response = Http::withHeaders([
            'Authorization' => 'key ' . config('services.khalti.secret_key'),
            'Content-Type' => 'application/json',
        ])->post(config('services.khalti.base_url') . '/epayment/initiate/', [
            'return_url' => $frontendUrl . '/payment/callback',
            'website_url' => $frontendUrl,
            'amount' => (int) round($order->final_price * 100),
            'purchase_order_id' => (string) $order->id,
            'purchase_order_name' => $order->auction->product->title,
            'customer_info' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'phone' => $request->user()->phone_number ?? '9800000000',
            ],
        ]);

        if ($response->failed()) {
            return response()->json(['message' => 'Could not start Khalti payment', 'details' => $response->json()], 422);
        }

        $data = $response->json();
        $order->update(['khalti_pidx' => $data['pidx']]);

        return response()->json(['payment_url' => $data['payment_url'], 'pidx' => $data['pidx']]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'pidx' => 'required|string',
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::find($request->order_id);
        if (!$order || $order->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $response = Http::withHeaders([
            'Authorization' => 'key ' . config('services.khalti.secret_key'),
            'Content-Type' => 'application/json',
        ])->post(config('services.khalti.base_url') . '/epayment/lookup/', [
            'pidx' => $request->pidx,
        ]);

        $data = $response->json();

        if (($data['status'] ?? null) === 'Completed') {
            $order->update([
                'status' => 'paid_escrow',
                'khalti_transaction_id' => $data['transaction_id'],
                'paid_at' => now(),
            ]);
            return response()->json(['message' => 'Payment verified. Funds are held pending delivery confirmation.', 'order' => $order]);
        }

        return response()->json(['message' => 'Payment not completed', 'status' => $data['status'] ?? 'unknown'], 400);
    }

    public function confirmReceipt(Request $request, $id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }
        if ($order->buyer_id !== $request->user()->id) {
            return response()->json(['message' => 'You are not authorized to do this'], 403);
        }
        if ($order->status !== 'paid_escrow') {
            return response()->json(['message' => 'This order is not awaiting receipt confirmation'], 400);
        }

        $order->update(['status' => 'completed', 'escrow_released_at' => now()]);

        return response()->json(['message' => 'Receipt confirmed. Funds released to seller.', 'order' => $order]);
    }
}