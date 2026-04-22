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
     * Get Command List
     */
    public function index(): JsonResponse
    {
        try {
            $commands = $this->commandService->getAllCommandsWithSubsystems();
            return response()->json($commands);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch commands: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     *  Get a command by ID
     */
    public function show($id): JsonResponse
    {
        try {
            $command = $this->commandService->getCommandById($id);
            return response()->json($command);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch command: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     *  Send a command
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
                'log_id' => $log->id,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to dispatch command: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     *  Show command log 
     */
    public function getCommandLog($id): JsonResponse
    {
        try {
            $log = CommandLog::with('command')->findOrFail($id);
            return response()->json($log);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch command log: ' . $e->getMessage(),
            ], 400);
        }
    }


    /**
     * Get Command History 
     */
    public function history(): JsonResponse
    {
        try {
            $history = CommandLog::with('command')
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
     * Get all command replies 
     */
    public function getReplies(): JsonResponse
    {
        try {
            $replies = $this->commandService->getAllReplies();
            return response()->json($replies);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch command replies: ' . $e->getMessage(),
            ], 400);
        }
    } 
}
