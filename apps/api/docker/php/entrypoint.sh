#!/bin/bash
set -e

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

if [ -n "${APP_KEY:-}" ]; then
    if grep -q '^APP_KEY=' .env; then
        sed -i "s|^APP_KEY=.*|APP_KEY=${APP_KEY}|" .env
    else
        printf '\nAPP_KEY=%s\n' "$APP_KEY" >> .env
    fi
else
    if grep -q '^APP_KEY=base64:' .env; then
        unset APP_KEY
    else
        echo "First run detected: Generating application key..."
        php artisan key:generate --force
        unset APP_KEY
    fi
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
