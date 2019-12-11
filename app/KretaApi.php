<?php
namespace App;

use GuzzleHttp\Client as Client;
use GuzzleHttp\Cookie\CookieJar;
use Illuminate\Support\Str;

date_default_timezone_set('Europe/Budapest');

function _group_by($array, $key, $kv = true) {
    $return = array();
    foreach($array as $val) {
        if($kv) {
            $return[$val->{$key}][] = $val;
        } else {
            if(!isset($return[$val->{$key}])) {
                $return[$val->{$key}] = (object) ['items' => []];
                $return[$val->{$key}]->{$key} = $val->{$key};
            }
            $return[$val->{$key}]->items[] = $val;
        }
    }
    return $return;
}

class KretaApi {
    public static $jar;
    private static function client($base_uri) {
        return new Client([
            'base_uri' => "$base_uri",
            'cookies' => self::$jar,
        ]);
    }
    public static function cookies($cookies = null) {
        if(isset($cookies)) {
            self::$jar->fromArray($cookies, request()->getHttpHost());
        } else {
            return self::$jar->toArray();
        }
    }
    private static function send($school, $endpoint, $token = null, $data = null)
    {
        $method = 'GET';
        // $v = config('app.version');
        $options = [
            'verify' => false,
            'headers' => [
                 'User-Agent' => "Kreta.Ellenorzo/2.9.4.2019101401 (Android; <codename> 0.0)"
            ],
        ];
        if($endpoint == 'Token') {
            $options['form_params'] = $data;
            $options['form_params']['client_id'] = '919e0c1c-76a2-4646-a2fb-7085bbbf3c56';
            $method = 'POST';
            $namespace = 'idp';
        } else {
            if(isset($data)) {
                $options['json'] = $data;
                $method = 'POST';
            }
            $options['headers']['Authorization'] = "bearer $token";
            $namespace = 'mapi';
        }
        if($school == 'eugyintezes') {
            $uri = "/integration-kretamobile-api/v1/$endpoint";
        } else {
            $uri = "$namespace/api/v1/$endpoint";
        }
        return self::client("https://$school.e-kreta.hu")->request($method, $uri, $options)->getBody();
    }

    public static function schools()
    {
        $response = self::client('https://kretaglobalmobileapi.ekreta.hu')->get('/api/v2/Institute', [
            'headers' => [
                'apiKey' => '7856d350-1fda-45f5-822d-e1a2f3f1acf0'
            ],
        ])->getBody();
        $sch = json_decode($response);
        $out = [];
        foreach ($sch as $school) {
            $out[] = array(
                'name' => $school->Name,
                'code' => $school->InstituteCode
            );
        }
        // file_put_contents("../public/datas.json", json_encode($out, JSON_UNESCAPED_UNICODE));
        return $out;
    }

    public static function logIn($school, $username, $password) {
        $response = self::send($school, 'Token', null, [
                'institute_code' => $school,
                'userName' => $username,
                'password' => $password,
                'grant_type' => 'password',
        ]);
        $res = json_decode($response);
        return $res;
    }

    public static function getToken($school, $rt)
    {
        $out = self::send($school, 'Token', null, [
                'refresh_token' => $rt,
                'grant_type' => 'refresh_token',
        ]);

        $out = json_decode($out);
        if (isset($out) && is_object($out)) {
            return self::wrapApi($out);
        } else {
            return false;
        }
    }

    public static function getEvents($school, $tok)
    {
        $out = self::send($school, 'EventAmi', $tok);
        return json_decode($out);
    }

    public static function getStudent($school, $tok)
    {
        $out = json_decode(
            self::send($school, 'StudentAmi', $tok)
        );
        $out->events = self::getEvents($school, $tok);
        $out = self::wrapApi($out);
        $evals = [];
        $groupedEvals = [];
        foreach ($out->evaluations as $eval) {
            switch ($eval->form) {
                case 'Deportment':
                    $eval->subject = "Magatartás";
                break;

                case 'Diligence':
                    $eval->subject = "Szorgalom";
                break;
                case 'Mark':
                    $eval->value = explode('(', $eval->value)[0];
                    break;
                default:
                    $newVal = ucfirst($eval->value);

                    switch (ucfirst($eval->value)) {
                        case "Példás":
                        case "Megfelelt":
                            $newVal = 5;
                            break;

                        case "Jó":
                            $newVal = 4;
                            break;

                        case "Változó":
                        case "Közepes":
                            $newVal = 3;
                            break;

                        case "Hanyag":
                        case "Elégséges":
                            $newVal = 2;
                            break;

                        case "Elégtelen":
                            $newVal = 1;
                            break;

                        default:
                            break;

                    }
                    $eval->numberValue = $newVal;
                    break;
            }
            unset($eval->formName, $eval->subjectCategory, $eval->jelleg, $eval->ertekFajta);
            $eval->typeName = explode('/', $eval->typeName)[0];

            $theme = $eval->theme;
            if (empty($theme)) {
                $evals[] = $eval;
                continue;
            }
            if (!isset($groupedEvals[$theme])) {
                $groupedEvals[$theme] = [];
            }

            $groupedEvals[$theme][] = $eval;
        }

        foreach ($groupedEvals as $group) {
            if (count($group) > 1) {
                for ($i = 0; $i < count($group); $i++) {
                    if (isset($group[$i + 1]) && $group[$i]->date == $group[$i + 1]->date && $group[$i]->type == $group[$i + 1]->type && $group[$i]->weight == $group[$i + 1]->weight && $group[$i]->subject == $group[$i + 1]->subject) {
                        $a = $group[$i];
                        $b = $group[$i + 1];
                        if (abs($a->numberValue - $b->numberValue) == 1) {
                            $w = str_replace('%', '', $a->weight) * 2;
                            if ($w <= 200) {
                                $a->weight = "$w%";
                                $a->numberValue = $a->value = $a->numberValue > $b->numberValue ? "$b->numberValue/$a->numberValue" : "$a->numberValue/$b->numberValue";
                                $group[$i + 1]->Was = 1;
                                $evals[] = $a;
                                continue;
                            }
                        }
                    }

                    if (!isset($group[$i]->Was)) {
                        $evals[] = $group[$i];
                    }
                }
            } else {
                $evals = array_merge($evals, $group);
            }
        }
        usort($evals, function ($a, $b) {
            return $b->creatingTime - $a->creatingTime;
        });
        $out->evaluations = $evals;

        $ids = array_column($out->absences, 'id');

        $out->absences = array_filter(
            array_map(function($abs){
                $abs->date = $abs->lessonStartTime;
                unset($abs->lessonStartTime);
                return $abs;
            }, $out->absences),
            function ($value, $key) use ($ids) {
                return $key === array_search($value->id, $ids);
            },
            ARRAY_FILTER_USE_BOTH
        );
        
        usort(
            $out->absences,
            function ($a, $b) {
                return $a->numberOfLessons - $b->numberOfLessons;
            }
        );

        $out->absences = _group_by($out->absences, 'date', false);

        usort(
            $out->absences,
            function ($a, $b) {
                return $b->date - $a->date;
            }
        );

        if ($school == 'klik035220001') {
            $toldyClassCode = explode('.',
                collect($out->osztalyCsoportok)->firstWhere('osztalyCsoportTipus', 'Osztaly')->nev
            );
            $toldyClassCode = (date('Y') - $toldyClassCode[0] + ((date('m') < 13 && date('m') > 8) ? 7 : 6)) . $toldyClassCode[1];
            $htmlinput = self::client('http://toldygimnazium.hu')->get("/cimke/$toldyClassCode")->getBody();
            $doc = new \DOMDocument();
            @$doc->loadHTML($htmlinput);
            $xpath = new \DOMXpath($doc);
            $conts = $xpath->query("//article[contains(@class, 'cleara')]");
            $hirdetmenyek = [];
            foreach ($conts as $container) {
                $arr = $container->getElementsByTagName("a");
                foreach ($arr as $item) {
                    if ($item->parentNode->tagName == "h3") {
                        $con = $item->textContent;
                        $url = $item->getAttribute('href');
                        $id = explode('/', $url);
                        $id = array_pop($id);
                    }

                    if ($item->parentNode->tagName == "p") {
                        $author = $item->textContent;
                    }
                }

                $arr = $container->getElementsByTagName("h3");
                foreach ($arr as $item) {
                    if ($item->parentNode->tagName == "article") {
                        $date = self::parseToldyDate($item->textContent);
                        $nxt = $xpath->query("following-sibling::*[1]", $item)->item(0);
                        $title = substr(join(', ', explode('▼', trim(preg_replace("/\s+/", " ", $nxt->textContent)))), 0, -4);
                    }
                }
                $endDate = self::client(null)->get($url)->getBody();
                $doc2 = new \DOMDocument();
                @$doc2->loadHTML($endDate);
                $xpath2 = new \DOMXpath($doc2);
                $endDate = $xpath2->query("//p[contains(@class, 'tinfo-info')]")[0];
                $endDate = self::parseToldyDate(explode(': ', $endDate->textContent)[1]);
                $links = $xpath2->query("//ul[contains(@class, 'tinfo-page-downloadables-holder')]/li/a");
                $attachments = [];
                foreach($links as $link) {
                    $attachments[] = [
                        'title' => $link->textContent,
                        'url' => $link->getAttribute('href')
                    ];
                }
                $hirdetmenyek[] = [
                    'date' => $date,
                    'content' => trim(ucwords($title)) . ": $con",
                    'teacher' => $author,
                    'attachments' => $attachments,
                    'id' => "tld$id",
                    'endDate' => $endDate
                ];
            }

            $out->events = array_merge($out->events, $hirdetmenyek);
        }
        $out->classAverages = array_map(function ($a) {
            return ['subject' => $a->Subject, 'value' => $a->ClassValue];
        },json_decode(self::send($school, 'Student?fromDate=1970-01-01&toDate=1970-01-01', $tok))->SubjectAverages);
        unset($out->lessons, $out->formTeacher);
        return $out;
    }

    public static function timetable($school, $tok, $from, $to, $group = true)
    {
        $out = self::send($school, 'LessonAmi?'. http_build_query([
            'fromDate' => date('Y-m-d', $from),
            'toDate' => date('Y-m-d', $to)
        ]), $tok);
        $out = self::wrapApi(
            json_decode($out)
        );
        if(!$group) return $out;
        usort(
            $out,
            function ($a, $b) {
                return $a->count - $b->count;
            }
        );
        return _group_by($out, 'date');
    }

    public static function getHomeWork($school, $tok, $id)
    {
        $ret = self::send($school, "HaziFeladat/TanuloHaziFeladatLista/$id",$tok);
        if (!$ret || empty($ret)) {
            return [];
        }

        return self::wrapApi(
            json_decode($ret)
        );
    }

    public static function getTeacherHomeWork($school, $tok, $id)
    {
        $out = self::send($school, "HaziFeladat/TanarHaziFeladat/$id", $tok);
        if (!$out || empty($out)) {
            return [];
        }

        return self::wrapApi(
            json_decode($out)
        );
    }

    public static function getHomeworkList($school, $tok) {
        $out = self::send($school, "HaziFeladat/TanuloHaziFeladatLista", $tok);
        if (!$out || empty($out)) {
            return [];
        }

        return self::wrapApi(
            json_decode($out)
        );
    }

    public static function getMessages($tok) {
        $out = self::send('eugyintezes', "/kommunikacio/uzenetek/sajat", $tok);
        if (!$out || empty($out)) {
            return [];
        }

        return self::wrapApi(
            json_decode($out)
        );
    } 

    public static function getMessage($tok, $id) {
        $out = self::send('eugyintezes', "/kommunikacio/uzenetek/$id", $tok);
        if (!$out || empty($out)) {
            return [];
        }

        return self::wrapApi(
            json_decode($out)
        );
    } 

    public static function getAttachment($tok, $id) {
        $out = self::send('eugyintezes', "/dokumentumok/uzenetek/$id", $tok);
        if (!$out || empty($out)) {
            return [];
        }

        return self::wrapApi(
            json_decode($out)
        );
    } 

    public static function getExams($school, $tok, $from, $to) {
        $ret = self::send($school, 'BejelentettSzamonkeres?' . http_build_query([
            'DatumTol' => date('Y-m-d', $from),
            'DatumIg' => date('Y-m-d', $to)
        ]), $tok);
        if (!$ret || empty($ret)) {
            return [];
        }

        return self::wrapApi(
            json_decode($ret)
        );
    }

    private static function wrapApi($obj)
    {
        $isObj = is_object($obj);
        $ret = $isObj ? (object) [] : [];
        foreach ($obj as $key => $val) {
            $newKey = lcfirst($key);
            if (is_object($val) || is_array($val)) {
                $newVal = self::wrapApi($val);
            } else {
                if (Str::endsWith($key, ['UTC', 'Utc', 'Date', 'Time'])) {
                    $newVal = strtotime($val);
                    $newKey = str_replace(['Utc', 'UTC'], '', $newKey);
                } else {
                    $newVal = $val;
                }
            }
            if (Str::endsWith($key, 'Id')) {
                $newKey = $key == 'SchoolYearId' ? 'schoolYearId' : 'id';
            } elseif ($key === 'Teacher') {
                if (Str::contains($val, 'Helyettesítő: ')) {
                    $newVal = '';
                    $ret->deputyTeacher = str_replace('Helyettesítő: ', '', $val);
                }
            }
            if ($isObj) {
                $ret->{$newKey} = $newVal;
            } else {
                $ret[$newKey] = $newVal;
            }
        }
        return $ret;
    }

    private static function parseToldyDate($date) {
        if($date == 'ma') return date('Y-m-d');
        $date = str_replace('.', '', $date);
        $date = explode(' ', $date);
        $day = array_pop($date);
        $month = self::$months[array_pop($date)];
        if (isset($date[0])) {
            $year = $date[0];
        } else {
            $year = date('Y');
        }

        return strtotime("$year-$month-$day");
    }
    private static $months = [
        'szeptember' => 9,
        'október' => 10,
        'november' => 11,
        'december' => 12,
        'január' => 01,
        'február' => 02,
        'március' => 03,
        'aprilis' => 04,
        'május' => 05,
        'június' => 06,
    ];
}

KretaApi::$jar = new CookieJar();