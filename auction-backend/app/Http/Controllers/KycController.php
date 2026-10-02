<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class KycController extends Controller
{
    public function submit(Request $request)
    {
        $fileRule = function ($attribute, $value, $fail) {
            $allowed = [
                'jpg',
                'jpeg',
                'png',
                'gif',
                'webp',
                'heic',
                'heif',
            ];

            $ext = strtolower(
                $value->getClientOriginalExtension()
            );

            if (!in_array($ext, $allowed)) {
                $fail(
                    'The ' . $attribute .
                    ' must be a jpg, png, gif, webp, heic, or heif file.'
                );
            }
        };

        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'photo' => ['required', 'max:5120', $fileRule],
            'citizenship_front' => ['required', 'max:5120', $fileRule],
            'citizenship_back' => ['required', 'max:5120', $fileRule],
        ]);

        $user = $request->user();

        $user->name = $request->name;
        $user->phone_number = $request->phone_number;

        $user->kyc_photo = $request
            ->file('photo')
            ->store('kyc', 'public');

        $user->kyc_citizenship_front = $request
            ->file('citizenship_front')
            ->store('kyc', 'public');

        $user->kyc_citizenship_back = $request
            ->file('citizenship_back')
            ->store('kyc', 'public');

        // Mark the submitted KYC request as pending.
        $user->kyc_status = 'pending';

        $user->save();

        return response()->json([
            'message' => 'KYC submitted, pending review',
            'user' => $user->fresh(),
        ], 200);
    }
}