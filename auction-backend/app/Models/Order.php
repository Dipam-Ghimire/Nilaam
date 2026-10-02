<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'auction_id', 'buyer_id', 'seller_id', 'final_price', 'status',
        'khalti_pidx', 'khalti_transaction_id', 'paid_at', 'escrow_released_at',
    ];

    public function auction()
    {
        return $this->belongsTo(Auction::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}