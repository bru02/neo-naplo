<?php

return [

    'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),

    // capture release as git sha
    'release' => env('APP_VERSION'),

    'breadcrumbs' => [

        // Capture bindings on SQL queries logged in breadcrumbs
        'sql_bindings' => true,

    ],

];
