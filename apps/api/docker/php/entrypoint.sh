#!/bin/bash
set -e

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

if [ -z "${APP_KEY:-}" ]; then
    echo "First run detected: Generating application key..."
    php artisan key:generate --force
    unset APP_KEY
fi

CONTAINER_ROLE="${CONTAINER_ROLE:-app}"
if [ "$CONTAINER_ROLE" = "app" ]; then
    php artisan migrate --force
    php artisan storage:link || true
fi

if [ "$#" -gt 0 ]; then
    exec "$@"
fi

exec php artisan serve --host=0.0.0.0 --port=8000
