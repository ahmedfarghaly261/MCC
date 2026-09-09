FROM php:8.2-cli-alpine

# System deps
RUN apk add --no-cache \
    bash curl git unzip \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    libzip-dev oniguruma-dev icu-dev \
    libxml2-dev curl-dev \
    nodejs npm \
    postgresql-dev \
    linux-headers \
    $PHPIZE_DEPS
    
# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) \
    pdo_mysql pdo_pgsql \
    gd zip bcmath intl opcache curl mbstring xml \
    pcntl sockets posix

    
# Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
COPY . .

RUN cp .env.example .env \
 && composer install --prefer-dist --optimize-autoloader --no-interaction \
 && (php artisan storage:link || true)

# Build the Laravel package assets that live under resources/.
RUN npm ci \
 && npm run build \
 && rm -rf node_modules /root/.npm

# Permissions
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 775 /var/www/html/storage \
 && chmod -R 775 /var/www/html/bootstrap/cache

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
