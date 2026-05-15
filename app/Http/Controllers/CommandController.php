<?php

namespace App\Http\Controllers;

use App\Services\CommandService;
use App\Models\CommandLog;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use App\Models\Command;
use App\Jobs\SendCommandJob;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
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
            return response()->json(['message' => 'Failed to fetch commands: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Get a command by ID
     */
    public function show($id): JsonResponse
    {
        try {
            $command = $this->commandService->getCommandById($id);
            return response()->json($command);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to fetch command: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Send a command
     */
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'command_id'           => 'required|integer|exists:commands,id',
            'dest_address'         => 'required|integer',
            'data'                 => 'nullable|array',
            'data.pwrl_id'         => 'nullable|string',
            'data.image_id'        => 'nullable|integer',
            'data.timer_value'     => 'nullable|integer',
            'data.mode_id'         => 'nullable|string',
            'data.sequence_number' => 'nullable|integer',
            'data.window_size'     => 'nullable|integer',
            'data.tlm_frame_seq_no'=> 'nullable|integer',
        ]);

        try {
            $command = $this->commandService->getCommandById($request->input('command_id'));

            $payload = array_filter(
                $request->input('data', []),
                fn ($value) => $value !== null
            );

            $this->commandService->validateCommandData($command->id, $payload);

            $log = CommandLog::create([
                'command_id'      => $command->id,
                'dest_address'    => sprintf('0x%02X', $request->input('dest_address')),
                'src_address'     => sprintf('0x%02X', 0xB0),
                'raw_binary_sent' => null,
                'status'          => 'pending',
                'data'            => $payload,
                'sent_at'         => now(),
            ]);

            $job = new SendCommandJob(
                $command->id,
                $request->input('dest_address'),
                $payload,
                $log->id,
                $command->name,
            );

            if ($command->name === 'GIMG') {
                $job->onQueue('images');
            }

            dispatch($job);

            return response()->json([
                'message' => 'Command queued successfully',
                'log_id'  => $log->id,
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to queue command: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Show command log
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
            return response()->json(['message' => 'Failed to fetch command log: ' . $e->getMessage()], 400);
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
            return response()->json(['message' => 'Failed to fetch command history: ' . $e->getMessage()], 400);
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
            return response()->json(['message' => 'Failed to fetch command replies: ' . $e->getMessage()], 400);
        }
    }

    /**
     * Download the reconstructed PNG image for a GIMG command log.
     *
     * Route:  GET /api/commands/logs/{id}/image
     *
     * Looks up the `images` record whose command_log_id matches the log,
     * then streams the PNG from disk.
     */
    public function downloadImage(int $id):BinaryFileResponse|JsonResponse
    {
        try {
            $log = CommandLog::findOrFail($id);

            $imageRecord = Image::where('command_log_id', $log->id)->latest()->first();

            if (!$imageRecord) {
                return response()->json([
                    'message' => 'No image available for this command log. '
                               . 'Current status: "' . $log->status . '".',
                ], 404);
            }

            // Prefer enhanced version; fall back to original
            $relativePath = $imageRecord->enhanced_path ?? $imageRecord->original_path;

            if (!Storage::disk('public')->exists($relativePath)) {
                return response()->json([
                    'message'  => 'Image file not found on disk. It may have been deleted.',
                    'expected' => Storage::disk('public')->path($relativePath),
                ], 404);
            }

            $filePath = Storage::disk('public')->path($relativePath);

            return response()->file($filePath, [
                'Content-Type'        => 'image/png',
                'Content-Disposition' => 'attachment; filename="' . basename($filePath) . '"',
            ]);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to download image: ' . $e->getMessage()], 400);
        }
    }
}
