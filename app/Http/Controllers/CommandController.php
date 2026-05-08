<?php

namespace App\Http\Controllers;

use App\Services\CommandService;
use App\Models\CommandLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Command;
use App\Jobs\SendCommandJob;
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
            'command_id'   => 'required|integer|exists:commands,id',
            'dest_address' => 'required|integer',
            'data' => 'nullable|array',
            'data.pwrl_id' => 'nullable|string',
            'data.image_id' => 'nullable|integer',
            'data.timer_value' => 'nullable|integer',
            'data.mode_id' => 'nullable|string',
            'data.sequence_number' => 'nullable|integer',
            'data.window_size' => 'nullable|integer',
            'data.tlm_frame_seq_no' => 'nullable|integer',
        ]);

        try {
            $command = $this->commandService->getCommandById($request->input('command_id'));

            $payload = array_filter(
                $request->input('data', []),
                fn ($value) => $value !== null
            );

            $this->commandService->validateCommandData($command->id, $payload);

            // Create the log immediately so we can return the ID right away
            $log = CommandLog::create([
                'command_id'      => $command->id,
                'dest_address'    => sprintf('0x%02X', $request->input('dest_address')),
                'src_address'     => sprintf('0x%02X', 0xB0), // SRC_GCS
                'raw_binary_sent' => null,
                'status'          => 'pending',
                'data'            => $payload,
                'sent_at'         => now(),
            ]);

            SendCommandJob::dispatch(
                $command->id,
                $request->input('dest_address'),
                $payload,
                $log->id,
            );

            return response()->json([
                'message' => 'Command queued successfully',
                'log_id'  => $log->id,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to queue command: ' . $e->getMessage(),
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
            $log->makeHidden('updated_at');
            $log->command->makeHidden([
                'allowed_sources',
                'allowed_destinations',
                'created_at',
                'updated_at',
            ]);
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
