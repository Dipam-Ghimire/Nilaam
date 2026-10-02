<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
    'title', 'description', 'category', 'condition',
    'starting_price', 'seller_id', 'image_url', 'city', 'status',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function auction()
    {
        return $this->hasOne(Auction::class);
    }
}
