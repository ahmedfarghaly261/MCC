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

# The built-in Laravel development server starts a child PHP process. Persist
# Compose-provided connection settings into .env so that child process uses the
# same database and Redis configuration as the container entrypoint.
sync_env_value() {
    local key="$1"
    local value="${!key:-}"
    local escaped_value

    [ -n "$value" ] || return 0
    escaped_value=$(printf '%s' "$value" | sed 's/[\\&|]/\\&/g')

    if grep -q "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${escaped_value}|" .env
    else
        printf '\n%s=%s\n' "$key" "$value" >> .env
    fi
}

sync_env_value_allow_empty() {
    local key="$1"
    local value="${!key:-}"
    local escaped_value

    escaped_value=$(printf '%s' "$value" | sed 's/[\\&|]/\\&/g')

    if grep -q "^${key}=" .env; then
        sed -i "s|^${key}=.*|${key}=${escaped_value}|" .env
    else
        printf '\n%s=%s\n' "$key" "$value" >> .env
    fi
}

sync_env_value DB_HOST
sync_env_value DB_PORT
sync_env_value DB_DATABASE
sync_env_value DB_USERNAME
sync_env_value DB_PASSWORD
sync_env_value REDIS_HOST
sync_env_value REDIS_PORT
sync_env_value REDIS_PASSWORD
sync_env_value SATELLITE_API_URL
sync_env_value COMMAND_API_URL
sync_env_value DECODER_API_URL
sync_env_value APP_URL
sync_env_value FRONTEND_URL
sync_env_value SESSION_DRIVER
sync_env_value SANCTUM_STATEFUL_DOMAINS
sync_env_value_allow_empty SESSION_DOMAIN

CONTAINER_ROLE="${CONTAINER_ROLE:-app}"
if [ "$CONTAINER_ROLE" = "app" ]; then
    php artisan migrate --force
    php artisan storage:link || true
fi

if [ "$#" -gt 0 ]; then
    exec "$@"
fi

exec php artisan serve --host=0.0.0.0 --port=8000
