<?php

namespace App\Jobs;
use App\KretaApi;
use App\Providers\KretaUserProvider;
use Illuminate\Support\Facades\DB;
use FCM;
use FCMGroup;
use LaravelFCM\Message\OptionsBuilder;
use LaravelFCM\Message\PayloadDataBuilder;
use LaravelFCM\Message\PayloadNotificationBuilder;
           // $new_absences_bejustified = self::absencesBejustified(
            //     $data->absences
            // )->diff(
            //     json_decode($row->absences_bejustified)
            // );
class SendNotifications {
    public function __invoke()
    {
        $rows = DB::table('fcm_groups')->dump()->get();
        foreach($rows as $row) {
            $user = $this->getUser($row->user_id);
            if(!isset($user)) {
                DB::table('fcm_groups')->where('user_id', $row->user_id)->delete();
                continue;
            }
            $data = $user->loadData();
            $hirdetmenyek = self::loadHirdetmenyek($user->school,
            $data->osztalyCsoportok);
            $events = $user->loadEvents();
            $eph = collect($events)->concat($hirdetmenyek);
            $new_events =  self::events(
               $events,
                $hirdetmenyek
            )->diff(
                json_decode($row->events)
            )->map(function ($e) use ($eph) {
                return $eph->firstWhere('id', $e);
            });
            $notificationKey = $row->notification_key;
            foreach($new_events as $event) {
                $this->sendNotification($notificationKey, $event->title, $event->body, "/event/$event->id", 'event');
            }
            $lessons = collect($user->getTimeTable(
                strtotime('last sunday'),
                strtotime('next saturday'),
                false
            ));
            $new_changed_lessons = self::changedLessons(
                $lessons
                )->diff(
                    json_decode($row->changed_lessons)
                )->map(function ($l) use ($lessons) {
                    return $lessons->firstWhere('id', $l);
                });
            foreach($new_changed_lessons as $lesson) {
                $day = [
                    'Vasárnap',
                    'Hétfő',
                    'Kedd',
                    'Szerda',
                    'Csütörtök',
                    'Péntek',
                    'Szombat'
                ][date('w', $lesson->date)];
                $isJustification = !empty($lesson->deputyTeacher);
                $s = $isJustification ? 'ban' : '';
                $t = $isJustification ? "$lesson->deputyTeacher fog helyettesíteni" : "elmarad";
                $title = "$day $lesson->count. óra$s ($lesson->subject) $t";
                $this->sendNotification($notificationKey, $title, '', "/timetable/0/$lesson->date:$lesson->count", 'changedLesson');
            }
            $evaluation_creating_time = strtotime($row->evaluation_creating_time);

            $new_evaluations = array_filter($data->evaluations, function ($eval) use ($evaluation_creating_time)  {
                return $eval->creatingTime > $evaluation_creating_time;
            });
            foreach($new_evaluations as $eval) {
                $this->sendNotification($notificationKey, "$eval->subject: $eval->value", "$eval->weight - $eval->theme", "/evaluation/$eval->id", 'evaluation');
            }
            $absence_creating_time = strtotime($row->absence_creating_time);
            $new_absences = collect($data->absences)->transform(function($a) {
                return $a->items;
            })->collapse()->filter(function ($abs) use ($absence_creating_time) {
                return $abs->creatingTime > $absence_creating_time;
            });
            foreach($new_absences as $abs) {
                $this->sendNotification($notificationKey, "$abs->subject: $abs->typeName", "$abs->date - $eval->justificationStateName", "/absence/$abs->id", 'absence');
            }
            $note_creating_time = strtotime($row->note_creating_time);
            $new_notes = array_filter($data->evaluations, function ($note) use ($note_creating_time)  {
                return $note->creatingTime > $note_creating_time;
            });
            foreach($new_notes as $note) {
                $this->sendNotification($notificationKey, "$note->title", "$note->content #&bullet; $note->teacher","/$note->id", 'note');
            } 
            dump([
                'ev' => $new_events,
                'cl' => $new_changed_lessons,
                'a' => $new_absences,
                'e' => $new_evaluations,
                'n' => $new_notes
            ]);
        }
    }

    private function getUser($id) {
        $rows = DB::table('fcm_tokens')->where('user_id', $id)->get();
        foreach($rows as $row) {
            $rowId = $row->row_id;
            $key = $row->key;
            $tokens = DB::table('tokens')->find($rowId);
            if(!isset($tokens)) {
                self::deleteByRowID($rowId);
                continue;
            }
            $user = KretaUserProvider::retrieveByTokens($tokens->access_token, $tokens->refresh_token, $key, $tokens->remember_token);
            if(!isset($user)) {
                self::deleteByRowID($rowId);
                DB::table('tokens')->find($rowId)->delete();
                continue;
            }
            return $user;
        }
        return null;
    }

    public static function deleteByRowID($rowId) {
        $row = DB::table('fcm_tokens')->where('row_id', $rowId)->first();
        if(isset($row)) {
            DB::table('fcm_tokens')->where('row_id', $rowId)->delete();
            $id = $row->user_id;
            $token = $row->token;
            $notification_key = DB::table('fcm_groups')->where('user_id', $id)->value('notification_key');
            
            $key = FCMGroup::removeFromGroup("$id","$notification_key", [$token]);
            if(!isset($key)) {
                DB::table('fcm_groups')->where('user_id', $id)->delete();
            }
        }


    }
    public static function absencesBejustified($absences) {
        return collect($absences)->transform(function($a) {
            return $a->items;
        })->collapse()->filter(function ($value, $key) {
            return $value->justificationState === 'BeJustified';
        })->pluck('id');
    }
    public static function loadHirdetmenyek($school, $classGroups) {
        if($school === 'klik035220001') {

        return KretaApi::getHirdetmenyek(
            collect($classGroups)->firstWhere('osztalyCsoportTipus', 'Osztaly')->nev
        );
    }
    return [];
    }
    public static function events($events, $hirdetmenyek) {
        $events = collect($events);
        $events = $events->concat(
            $hirdetmenyek
        );
        
        return  $events->pluck('id');
    }
    public static function changedLessons($lessons) {
        return collect($lessons)->filter(function ($value, $key) {
            return (!empty($value->deputyTeacher) || $value->state === 'Missed') && $value->startTime > time();
        })->pluck('id');
    }
    private function sendNotification($notificationKey, $title, $body, $url, $collapseKey = 'filc') {
        $optionBuilder = new OptionsBuilder();
        $optionBuilder->setTimeToLive(60 * 60)->setCollapseKey($collapseKey);

        $notificationBuilder = new PayloadNotificationBuilder($title);
        $notificationBuilder->setBody($body);

        $dataBuilder = new PayloadDataBuilder();
        $dataBuilder->addData(['url' => $url]);

        $option = $optionBuilder->build();
        $notification = $notificationBuilder->build();
        $data = $dataBuilder->build();
        $groupResponse = FCM::sendToGroup($notificationKey, $option, $notification, $data);
        dump($groupResponse);
        $failed = $groupResponse->tokensFailed();
        foreach($failed as $token) {
            DB::table('fcm_tokens')->where('token', $token)->delete();
        }
    }   
}