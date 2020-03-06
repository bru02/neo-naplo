<?php

namespace App\Jobs;
use App\KretaApi;
use App\Providers\KretaUserProvider;
use Illuminate\Support\Facades\DB;
use FCM;
use FCMGroup;
use InvalidArgumentException;
use LaravelFCM\Message\OptionsBuilder;
use LaravelFCM\Message\PayloadDataBuilder;
use LaravelFCM\Message\PayloadNotificationBuilder;
use LogicException;
use Spatie\Async\Pool;

           // $new_absences_bejustified = self::absencesBejustified(
            //     $data->absences
            // )->diff(
            //     json_decode($row->absences_bejustified)
            // );
class SendNotifications {
    const dayMap = [
        'Vasárnap',
        'Hétfő',
        'Kedd',
        'Szerda',
        'Csütörtök',
        'Péntek',
        'Szombat'
    ];
    public function __invoke()
    {
        $rows = DB::table('fcm_groups')->get();

        $pool = Pool::create();

        foreach($rows as $row) {
            $pool->add(function () use ($row) {            
            $user = $this->getUser($row->user_id);

            if(!isset($user)) {
                DB::table('fcm_groups')->where('user_id', $row->user_id)->delete();
                throw new InvalidArgumentException('Bad credentials');
            }

            $data = $user->loadData();

            $storedEvents = collect(
                json_decode($row->events)
            );
            $events =  self::events(
                $user->loadEvents(),
                $user->school,
                $data->osztalyCsoportok
            );
            dump($events);
            $newEvents = $events->filter( function ($event) use ($storedEvents) {
                return !$storedEvents->has($event->id);
            });

            $notificationKey = $row->notification_key;
            
            foreach($newEvents as $event) {
                $this->sendNotification($notificationKey, $event->title, $event->content, "/event/$event->id", 'event');
            }

            $storedLessons = collect(
                json_decode(
                    $row->changed_lessons
                )
            );
            $changedLessons = self::changedLessons(
                    $user->getTimeTable(
                        strtotime('last sunday'),
                        strtotime('next saturday'),
                        false
                    )   
            )->filter( function ($lesson) use ($storedLessons) {
                return !$storedLessons->has($lesson->id);
            });

            foreach($changedLessons as $lesson) {
                $day = self::dayMap[
                    date('w', $lesson->date)
                ];
                $isJustification = !empty($lesson->deputyTeacher);
                $s = $isJustification ? 'ában' : 'a';
                $t = $isJustification ? "$lesson->deputyTeacher fog helyettesíteni" : "elmarad";
                $title = "$day $lesson->count. ór$s ($lesson->subject) $t";
                $this->sendNotification($notificationKey, $title, '', "/timetable/0/$lesson->date:$lesson->count", 'changedLesson');
            }


            $evaluationCT = strtotime($row->evaluation_creating_time);

            $newEvaluations = array_filter($data->evaluations, function ($eval) use ($evaluationCT)  {
                return $eval->creatingTime > $evaluationCT;
            });

            foreach($newEvaluations as $eval) {
                $this->sendNotification($notificationKey, "$eval->subject: $eval->value", "$eval->weight - $eval->theme", "/evaluation/$eval->id", 'evaluation');
            }


            $absenceCT = strtotime($row->absence_creating_time);
            $newAbsences = collect($data->absences)->transform(function($a) {
                return $a->items;
            })->collapse()->filter(function ($abs) use ($absenceCT) {
                return $abs->creatingTime > $absenceCT;
            });
            foreach($newAbsences as $abs) {
                $this->sendNotification($notificationKey, "$abs->subject: $abs->typeName", "$abs->date - $abs->justificationStateName", "/absence/$abs->id", 'absence');
            }
            $noteCT = strtotime($row->note_creating_time);
            $new_notes = array_filter($data->evaluations, function ($note) use ($noteCT)  {
                return $note->creatingTime > $noteCT;
            });
            foreach($new_notes as $note) {
                $this->sendNotification($notificationKey, "$note->title", "$note->content - $note->teacher","/$note->id", 'note');
            } 
        })->catch(function (LogicException $e) {

        })->catch(function (InvalidArgumentException $e) {
            
        });
        }
        $pool->wait();
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
        });
    }

    public static function events($events, $school, $classGroups) {
        $events = collect($events);
         if($school === 'klik035220001') {
            $events = $events->concat(
                KretaApi::getHirdetmenyek(
                    collect($classGroups)->firstWhere('osztalyCsoportTipus', 'Osztaly')->nev
                )
            );
        } 
        return  $events;
    }
    public static function changedLessons($lessons) {
        return collect($lessons)->filter(function ($value, $key) {
            return (!empty($value->deputyTeacher) || $value->state === 'Missed') && $value->startTime > time();
        });
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
        if($groupResponse->numberSuccess() + $groupResponse->numberFailure() === 0) {
            DB::table('fcm_groups')->where('notification_key', $notificationKey)->delete();
            throw new LogicException('No tokens in notification group');
        }
        $failed = $groupResponse->tokensFailed();
        foreach($failed as $token) {
            DB::table('fcm_tokens')->where('token', $token)->delete();
        }
    }   
}