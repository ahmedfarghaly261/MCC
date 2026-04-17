FROM php:8.2-fpm-alpine

# System deps
RUN apk add --no-cache \
    bash curl git unzip shadow \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    libzip-dev oniguruma-dev icu-dev \
    nodejs npm \
    postgresql-dev \
    linux-headers \
    $PHPIZE_DEPS
    
# PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) \
    pdo_mysql pdo_pgsql \
    gd zip bcmath intl opcache \
    pcntl sockets

# Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction

# Copy application
COPY . .



# Install PHP deps (no dev)
RUN composer install --optimize-autoloader --no-interaction

# Install & build frontend assets
RUN npm ci && npm run build && rm -rf node_modules

# Permissions
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 755 /var/www/html/storage \
 && chmod -R 755 /var/www/html/bootstrap/cache

COPY docker/php/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

EXPOSE 9000
CMD ["php-fpm"]