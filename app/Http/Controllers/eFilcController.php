<?php

namespace App\Http\Controllers;

use App\KretaApi;
use App\Jobs\SendNotifications;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use FCMGroup;
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
        return response()->json(
            Cache::remember('schools', strtotime('1 month', 0), function () {
                return KretaApi::schools();
            })
        );
    }
    public function updateToken() {
        $user = request()->user('api');
        $uid = $user->id;
        $token = request()->input('token');
        $sub = $user->getJWTIdentifier();
        if(!is_array($sub)) return response()->json(['error' => 'Not permanent user.'], 400);
        if(!DB::table('fcm_groups')->where('user_id', $uid)->exists()) {
            try {
                $notification_key = FCMGroup::createGroup("$uid", [$token]);
            } catch(ClientException $e) {
                $client = new Client();
                $notification_key =  json_decode($client->get("https://fcm.googleapis.com/fcm/notification?notification_key_name=$uid", [
                    'headers' => [
                        'project_id' => config('fcm.http.sender_id'),
                        'Content-Type' => 'application/json',
                        'Authorization' => 'key=' . config('fcm.http.server_key')
                    ]
                ])->getBody())->notification_key;
                FCMGroup::addToGroup("$uid", $notification_Key, [$token]);
            }
            

            $data = isset($user->data) ? $user->data : $user->loadData();

            DB::table('fcm_groups')->insert([
                'notification_key' => $notification_key,
                'user_id' => $uid,
                'events' => SendNotifications::events(
                    $user->loadEvents(),
                    $user->school,
                    $data->osztalyCsoportok
                )->pluck('id'),
                'changed_lessons' => SendNotifications::changedLessons(
                    $user->getTimeTable(
                        strtotime('last sunday'),
                        strtotime('next saturday'),
                        false
                    )
                )->pluck('id'),
                'absences_bejustified' => SendNotifications::absencesBejustified(
                    $data->absences
                )->pluck('id')
            ]);
        }
        $rowId = DB::table('tokens')->select('id')->where([
            ['kreta_id', $sub['id']],
            ['remember_token', $sub['hash']]
        ])->first()->id;
        if(DB::table('fcm_tokens')->where('row_id', $rowId)->exists()) {
            DB::table('fcm_tokens')->where('row_id', $rowId)->update([
                'token' => $token
            ]);
        } else {
            DB::table('fcm_tokens')->insert([
                [
                    'user_id' => $uid,
                    'row_id' => $rowId,
                    'key' => $sub['key'],
                    'token' => $token
                ]
            ]);
        }
        return response()->json(['message' => 'Success.'], 200);
    }
    public function deleteToken() {
        $user = request()->user('api');
        $sub = $user->getJWTIdentifier();
        $rowId = DB::table('tokens')->select('id')->where([
            ['kreta_id', $sub['id']],
            ['remember_token', $sub['hash']]
        ])->first()->id;
        SendNotifications::deleteByRowID($rowId);
        return response()->json(['message' => 'Success.'], 200);

    }
}
