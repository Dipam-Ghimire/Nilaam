<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuctionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BidController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\KycController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\NotificationController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    Route::get('/my-sales', [OrderController::class, 'mySales']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/pay', [PaymentController::class, 'initiate']);
    Route::post('/payment/verify', [PaymentController::class, 'verify']);
    Route::post('/orders/{id}/confirm-receipt', [PaymentController::class, 'confirmReceipt']);
    Route::post('/orders/{id}/release-escrow', [AdminController::class, 'releaseEscrow']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
});

Route::get('/marketplace-stats', [AdminController::class, 'marketplaceStats']);Route::get('/my-stats', [StatsController::class, 'mine'])->middleware('auth:sanctum');
Route::post('/change-password', [AuthController::class, 'changePassword'])->middleware('auth:sanctum');
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('products', ProductController::class)->only(['index', 'show']);
Route::apiResource('products', ProductController::class)
    ->only(['store', 'update', 'destroy'])
    ->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/products/pending', [AdminController::class, 'pendingProducts']);
    Route::post('/products/{id}/approve', [AdminController::class, 'approveProduct']);
    Route::post('/products/{id}/reject', [AdminController::class, 'rejectProduct']);
    Route::get('/kyc/pending', [AdminController::class, 'pendingKyc']);
    Route::post('/kyc/{id}/verify', [AdminController::class, 'verifyKyc']);
    Route::post('/kyc/{id}/reject', [AdminController::class, 'rejectKyc']);
});

Route::post('/kyc/submit', [KycController::class, 'submit'])->middleware('auth:sanctum');

Route::get('/my-products', [ProductController::class, 'myProducts'])->middleware('auth:sanctum');

Route::apiResource('auctions', AuctionController::class)->only(['index', 'show']);
Route::apiResource('auctions', AuctionController::class)
    ->only(['store'])
    ->middleware('auth:sanctum');
Route::post('/auctions/{id}/close', [AuctionController::class, 'close'])->middleware('auth:sanctum');
Route::post('/bids', [BidController::class, 'store'])->middleware('auth:sanctum');

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');