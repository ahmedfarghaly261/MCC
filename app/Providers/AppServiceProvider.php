<?php

namespace App\Providers;

use Illuminate\Support\Str;
use Illuminate\Support\ServiceProvider;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\Operation;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
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
                $controllerNamespace = $routeInfo->route->getActionName();

                if (Str::contains($controllerNamespace, 'Laravel\Fortify')) {
                    $operation->setTags(['Authentication']);
                }
            })->withDocumentTransformers(function (OpenApi $openApi) {
            $openApi->secure(
                SecurityScheme::http('bearer')
            );
        });
    }
}
