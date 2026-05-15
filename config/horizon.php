<?php

use Illuminate\Support\Str;

return [

    'name' => env('HORIZON_NAME'),

    'domain' => env('HORIZON_DOMAIN'),

    'path' => env('HORIZON_PATH', 'horizon'),

    'use' => 'default',

    'prefix' => env(
        'HORIZON_PREFIX',
        Str::slug(env('APP_NAME', 'laravel'), '_').'_horizon:'
    ),

    'middleware' => ['web'],

    'waits' => [
        'redis:default' => 60,
        'redis:images'  => 1000,
    ],

    'trim' => [
        'recent'        => 60,
        'pending'       => 60,
        'completed'     => 60,
        'recent_failed' => 10080,
        'failed'        => 10080,
        'monitored'     => 10080,
    ],

    'silenced' => [],

    'silenced_tags' => [],

    'metrics' => [
        'trim_snapshots' => [
            'job'   => 24,
            'queue' => 24,
        ],
    ],

    'fast_termination' => false,

    /*
    | Raised from 64 → 512 MB.
    | GIMG accumulates 2000+ chunks (200 bytes each = ~400 KB of payload) plus
    | WebSocket frame overhead, PHP array bookkeeping, and image GD processing.
    | 64 MB was causing Horizon to restart the master mid-job.
    */
    'memory_limit' => 512,

    'defaults' => [
        // ── Standard commands (ACK/NACK, telemetry) ───────────────────────────
        'supervisor-1' => [
            'connection'          => 'redis',
            'queue'               => ['default'],
            'balance'             => 'auto',
            'autoScalingStrategy' => 'time',
            'maxProcesses'        => 1,
            'maxTime'             => 0,
            'maxJobs'             => 0,
            'memory'              => 256,  // per-worker memory limit (MB)
            'tries'               => 1,
            'timeout'             => 90,   // normal commands finish in seconds
            'nice'                => 0,
        ],

        // ── Long-running image downloads (GIMG) ───────────────────────────────
        // 2009 chunks × 50ms = ~100s streaming + GD processing.
        // Isolated so a slow image download never blocks other commands.
        'supervisor-images' => [
            'connection'          => 'redis',
            'queue'               => ['images'],
            'balance'             => 'simple',
            'autoScalingStrategy' => 'time',
            'maxProcesses'        => 1,   // image downloads are sequential by nature
            'maxTime'             => 0,
            'maxJobs'             => 0,
            'memory'              => 512, // GD image processing needs headroom
            'tries'               => 1,
            'timeout'             => 1000, // 10 minutes — well above the ~100s stream time
            'nice'                => 0,
        ],
    ],

    'environments' => [
        'production' => [
            'supervisor-1' => [
                'maxProcesses'    => 10,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
            'supervisor-images' => [
                'maxProcesses' => 2,
            ],
        ],

        'local' => [
            'supervisor-1' => [
                'maxProcesses' => 3,
            ],
            'supervisor-images' => [
                'maxProcesses' => 1,
            ],
        ],
    ],

    'watch' => [
        'app',
        'bootstrap',
        'config/**/*.php',
        'database/**/*.php',
        'public/**/*.php',
        'resources/**/*.php',
        'routes',
        'composer.lock',
        'composer.json',
        '.env',
    ],
];