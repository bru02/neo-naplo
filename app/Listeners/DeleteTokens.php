<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;
use App\Jobs\SendNotifications;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;

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
        $user = $event->user;

        auth()->invalidate();

        if (Session::has('user')) {
            Session::remove('user');
        }
        if (isset($user->hash)) {
            $id = DB::table('tokens')->where([
                ['kreta_id', $user->hash],
                ['remember_token', $user->tokenData->{'idp:user_id'}]
            ])->value('id');

            if (isset($id)) {

                SendNotifications::deleteByRowID($id);

                DB::table('tokens')->select('*')->where([
                    ['kreta_id', $user->hash],
                    ['remember_token', $user->tokenData->{'idp:user_id'}]
                ])->delete();
            }
        }
    }
}
