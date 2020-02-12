<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;

class DeleteTokens
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    public function handle(Logout $event)
    {
        $user = $event->$user;
        DB::table('tokens')->select('*')->where([
            ['kreta_id', $user->hash],
            ['remember_token', $user->tokenData->{'idp:user_id'}]
        ])->delete();
    }
}
