<?php

namespace App\Http\Controllers;

use App\KretaApi;
use App\Jobs\SendNotifications;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use FCMGroup;
use Illuminate\Http\Request;


class eFilcController extends Controller
{

    public function generalApi(Request $request) {
        $user = $request->user('api');
        $data = isset($user->data) ? $user->data : $user->loadData();
        return response()->json($data, 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function timetableApi(Request $request) {
        $user = $request->user('api');
        $data = $user->getTimeTable(
            strtotime(
                $request->query('from', 'this week sunday')
            ),
            strtotime(
                $request->query('to', 'this week saturday')
            ),
            $request->query('group', 1) == 0 ? false : true 
        );
        return response()->json($data, 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function eventsApi(Request $request) {
        $user = $request->user('api');
        return response()->json($user->loadEvents(), 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function classAveragesApi(Request $request) {
        $user = $request->user('api');
        return response()->json($user->loadClassAverages(), 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function hirdetmenyekApi($class, Request $request) {
        $user = $request->user('api');
        return response()->json($user->loadHirdetmenyek($class), 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function examsApi(Request $request) {
        $user = $request->user('api');
        return response()->json($user->loadExams(), 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function createExam(Request $request) {
        $data = $request->validate([
            'subject' => 'required|max:100',
            'date' => 'required|date|after_or_equal:today',
            'count' => 'required|integer',
            'teacher' => 'required|max:150',
            'name' => 'required|max:250',
            'type' =>'required|max:150',
            'classGroup' => 'required|uuid'  
        ]);
        $exam = [
            'user_id' => $request->user('api')->id,
            'subject' => $data->subject,
            'date' => $data->date,
            'count' => $data->count,
            'teacher' => $data->teacher,
            'name' => $data->name,
            'type' => $data->type,
            'osztalyCsoportUid' => $data->classGroup,
        ];
        $exam['id'] = 'f' . DB::table('exams')->insertGetId($exam);
        return response()->json($exam);
    }

    public function deleteExam($id) {
        if($id[0] === 'f') $id = substr($id, 1);
        DB::table('exams')->find($id)->delete();
        return response()->json(['message' => 'Success.'], 200);
    }

    public function schoolsApi() {
        return response()->json(
            Cache::remember('schools', strtotime('1 month', 0), function () {
                return KretaApi::schools();
            })
        );
    }
    public function updateToken(Request $request) {
        $user = $request->user('api');
        $uid = $user->id;
        $token = $request->input('token');
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
                try {
                    FCMGroup::addToGroup("$uid", $notification_key, [$token]);
                }
                catch(\GuzzleHttp\Exception\ClientException $e) {
                    return response()->json(
                            json_decode(
                            $e->getResponse()->getBody()->getContents() ?? '{}'
                            ), 400
                    );
                }
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

    public function deleteToken(Request $request) {
        $user = $request->user('api');
        $sub = $user->getJWTIdentifier();
        $rowId = DB::table('tokens')->select('id')->where([
            ['kreta_id', $sub['id']],
            ['remember_token', $sub['hash']]
        ])->first()->id;
        SendNotifications::deleteByRowID($rowId);
        return response()->json(['message' => 'Success.'], 200);
    }
}
