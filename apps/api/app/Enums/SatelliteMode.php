<?php

namespace App\Enums;

enum SatelliteMode: string
{
    case Initialization = '0x01';
    case DeTumbling     = '0x02';
    case Normal         = '0x03';

    public function label(): string
    {
        return match($this) {
            self::Initialization => 'Initialization',
            self::DeTumbling     => 'De-tumbling',
            self::Normal         => 'Normal Operation',
        };
    }

    public function isStable(): bool
    {
        return $this === self::Normal;
    }
}