<?php

namespace App\Http\Controllers;

use App\Services\CommandService;
use App\Models\CommandLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\CommandReply;
use Exception;

class CommandController extends Controller
{
    protected CommandService $commandService;

    public function __construct(CommandService $commandService)
    {
        $this->commandService = $commandService;
    }

    /**
     * Endpoint to send a command
     */
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'command_id' => 'required|integer|exists:commands,id',
            'dest_address' => 'required|integer',
            'data' => 'array',
            'data.*' => 'integer|min:0|max:255',
        ]);
        try {
            $log = $this->commandService->dispatch(
                $request->input('command_id'),
                $request->input('dest_address'),
                $request->input('data', [])
            );
            return response()->json([
                'message' => 'Command dispatched successfully',
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to dispatch command: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Endpoint to show  a command status by log ID
     */
    public function getCommandStatus($id): JsonResponse
    {
        try {
            $log = CommandLog::with('commandDefinition')->findOrFail($id);
            return response()->json($log);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch command status: ' . $e->getMessage(),
            ], 400);
        }
    }


    /**
     * Get Command History for the Dashboard
     */
    public function history(): JsonResponse
    {
        try {
            $history = CommandLog::with('commandDefinition')
                ->orderBy('sent_at', 'desc')
                ->paginate(20);
            return response()->json($history);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch command history: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get command replies for a specific command log
     */
    public function getReplies($id): JsonResponse
    {
        try {
            $replies = CommandReply::where('command_log_id', $id)->get();
            return response()->json($replies);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch command replies: ' . $e->getMessage(),
            ], 400);
        }
    }
}
