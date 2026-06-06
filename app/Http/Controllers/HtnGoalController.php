<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Enums\HtnGoalType;
use Illuminate\Http\JsonResponse;

class HtnGoalController extends Controller
{
    /**
     * Display available HTN goals with meta structural payloads for UI rendering.
     */
    public function index(): JsonResponse
    {
        $goals = [];

        foreach (HtnGoalType::cases() as $goal) {
            $goals[] = [
                'id'          => $goal->value, 
                'name'        => $goal->label(), 
                'description' => $goal->description(),
                'parameters'  => $goal->expectedParameters() 
            ];
        }

        return response()->json([
            'status' => 'success',
            'data'   => $goals
        ]);
    }
}