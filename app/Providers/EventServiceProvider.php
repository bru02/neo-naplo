<?php

namespace App\Providers;

use App\Listeners\DeleteTokens;
use Illuminate\Auth\Events\Logout;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Logout::class => [
            DeleteTokens::class,
        ],
    ];
}
