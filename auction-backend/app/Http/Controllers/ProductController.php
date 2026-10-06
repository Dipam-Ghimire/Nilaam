<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
        'search' => ['nullable', 'string', 'max:100'],
    ]);

    $search = trim($validated['search'] ?? '');

    $query = Product::query()
        ->with(['images', 'user']);

    if ($search !== '') {
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', '%' . $search . '%')
              ->orWhere('description', 'like', '%' . $search . '%')
              ->orWhere('category', 'like', '%' . $search . '%')
              ->orWhere('city', 'like', '%' . $search . '%');
        });
    }

    return response()->json(
        $query->latest()->get()
    );
        return response()->json(
            Product::with('images')
                ->where('status', 'approved')
                ->get()
        );
    }

    public function myProducts(Request $request)
    {
        return response()->json(
            Product::with([
                'images',
                'auction.bids',
            ])
            ->where('seller_id', $request->user()->id)
            ->get()
        );
    }

    public function show($id)
    {
        $product = Product::with('images')->find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json($product);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'condition' => 'nullable|string',
            'starting_price' => 'required|numeric|min:0',
            'city' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => [
                'required',
                'max:5120',
                function ($attribute, $value, $fail) {
                    $allowed = [
                        'jpg',
                        'jpeg',
                        'png',
                        'gif',
                        'webp',
                        'heic',
                        'heif'
                    ];

                    $ext = strtolower(
                        $value->getClientOriginalExtension()
                    );

                    if (!in_array($ext, $allowed)) {
                        $fail(
                            'Each photo must be a jpg, png, gif, webp, heic, or heif file.'
                        );
                    }
                },
            ],
        ]);

        if (!in_array(
            $request->user()->role,
            ['seller', 'buyer_seller']
        )) {
            return response()->json([
                'message' => 'Only sellers can create listings'
            ], 403);
        }

        if ($request->user()->kyc_status !== 'verified') {
            return response()->json([
                'message' => 'You must complete KYC verification before listing an item'
            ], 403);
        }

        $product = Product::create([
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'condition' => $request->condition,
            'starting_price' => $request->starting_price,
            'seller_id' => $request->user()->id,
            'city' => $request->city,
            'status' => 'pending',
        ]);

        if ($request->hasFile('images')) {
            foreach (
                $request->file('images')
                as $index => $file
            ) {
                $path = $file->store(
                    'products',
                    'public'
                );

                $product->images()->create([
                    'image_path' => $path
                ]);

                if ($index === 0) {
                    $product->update([
                        'image_url' => $path
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Product created, pending approval',
            'product' => $product->load('images')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        if (
            $product->seller_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' => 'You are not authorized to do this'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'condition' => 'nullable|string',
            'starting_price' => 'required|numeric|min:0',
        ]);

        $product->update(
            $request->only([
                'title',
                'description',
                'category',
                'condition',
                'starting_price'
            ])
        );

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'message' => 'Product not found'
            ], 404);
        }

        if (
            $product->seller_id !==
            $request->user()->id
        ) {
            return response()->json([
                'message' => 'You are not authorized to do this'
            ], 403);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
}