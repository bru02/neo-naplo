<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;
use App\Jobs\SendNotifications;
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
        $id = DB::table('tokens')->where([
            ['kreta_id', $user->hash],
            ['remember_token', $user->tokenData->{'idp:user_id'}]
        ])->value('id');
        SendNotifications::deleteByRowID($id);
        DB::table('tokens')->select('*')->where([
            ['kreta_id', $user->hash],
            ['remember_token', $user->tokenData->{'idp:user_id'}]
        ])->delete();
    }
}
