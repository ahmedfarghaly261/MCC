<?php

namespace App\Providers;

use Illuminate\Support\Str;
use Illuminate\Support\ServiceProvider;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\Operation;
use Dedoc\Scramble\Support\RouteInfo;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
            Scramble::configure()
            ->routes(function ($route) {

                //  Allow your standard api routes and ALL Fortify vendor package routes
                return Str::startsWith($route->uri, 'api/') || Str::contains($route->getActionName(), 'Laravel\Fortify');
            })
            ->withOperationTransformers(function (Operation $operation, RouteInfo $routeInfo) {
                // Get the full namespace of the controller handling this endpoint
                $controllerNamespace = $routeInfo->route->getActionName();

                // Group EVERYTHING owned by Fortify (including Passkeys) into one clean folder
                if (Str::contains($controllerNamespace, 'Laravel\Fortify')) {
                    $operation->setTags(['Authentication']);
                }
            });
    }
}
