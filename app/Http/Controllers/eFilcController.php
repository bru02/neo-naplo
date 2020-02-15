<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class eFilcController extends Controller
{

    public function generalApi() {
        $user = request()->user('api');
        $data = isset($user->data) ? $user->data : $user->loadData();
        return response()->json($data, 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function timetableApi() {
        $user = request()->user('api');
        $data = $user->getTimeTable(
            strtotime(
                request()->query('from')
            ),
            strtotime(
                request()->query('to')
            ),
            request()->query('group', 1) == 0 ? false : true 
        );
        return response()->json($data, 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function eventsApi() {
        $user = request()->user('api');
        return response()->json($user->loadEvents(), 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function classAveragesApi() {
        $user = request()->user('api');
        return response()->json($user->loadClassAverages(), 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function hirdetmenyekApi($class) {
        $user = request()->user('api');
        return response()->json($user->loadHirdetmenyek($class), 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function schoolsApi() {
        return response()->file('datas.json');
    }

    // public function manifest() {
    //    return response()->json([
    //         "name"=> config('app.name'),
    //         "short_name" => "Filc",
    //         "theme_color" => "#303f9f",
    //         "background_color" => "#ffffff",
    //         "display" => "standalone",
    //         "lang" => "hu-HU",
    //         "scope"=> config('app.url') . '/',
    //         "start_url"=> config('app.url') . '/?utm_source=a2hs',
    //         "gcm_sender_id"=> config('webpush.gcm.sender_id') . '',
    //    ]);
          
    // }
}
