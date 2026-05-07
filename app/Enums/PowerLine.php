<?php

namespace App\Enums;

enum PowerLine: string
{
    case PWRL1 = '0xE1';
    case PWRL2 = '0xE2';
    case PWRL3 = '0xE3';
    case PWRL4 = '0xE4';
    case PWRL5 = '0xE5';
    case PWRL6 = '0xE6';
    case PWRL7 = '0xE7';
    case PWRL8 = '0xE8';
    case PWRL9 = '0xE9';

    public function label(): string
    {
        return match($this) {
            self::PWRL1 => 'Power Line 1',
            self::PWRL2 => 'Power Line 2',
            self::PWRL3 => 'Power Line 3',
            self::PWRL4 => 'Power Line 4',
            self::PWRL5 => 'Power Line 5',
            self::PWRL6 => 'Power Line 6',
            self::PWRL7 => 'Power Line 7',
            self::PWRL8 => 'Power Line 8',  
            self::PWRL9 => 'Power Line 9',
            default => $this->name,
        };
    }

    public function toInt(): int
    {
        return hexdec($this->value);
    }
}