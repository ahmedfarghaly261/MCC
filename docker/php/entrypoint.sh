#!/bin/bash
if ! grep -q "APP_KEY=base64" .env && [ -z "$APP_KEY" ]; then
    echo "First run detected: Generating application key..."
    php artisan key:generate --force
fi

# Run database migrations
php artisan migrate --force

# Run database seeders
php artisan db:seed --force

# Start PHP-FPM
exec php-fpm