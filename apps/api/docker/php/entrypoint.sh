#!/bin/bash
if ! grep -q "APP_KEY=base64" .env && [ -z "$APP_KEY" ]; then
    echo "First run detected: Generating application key..."
    php artisan key:generate --force
fi

CONTAINER_ROLE="${CONTAINER_ROLE:-app}"
if [ "$CONTAINER_ROLE" = "app" ]; then
    php artisan migrate --force
fi

if [ "$#" -gt 0 ]; then
    exec "$@"
fi

exec php-fpm