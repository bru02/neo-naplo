<?php

namespace App;

use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Log;
use Session;
use Jenssegers\Model\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Str;


class User extends Model implements Authenticatable, JWTSubject
{
    public $refresh_token;
    public $access_token;
    protected $encryptionKey;
    protected $hash;

    public $school;
    public $id;
    private $timetable;
    private $rme;

    private $tokenData;

    public function __construct($result = null, $keys = null)
    {
        if(isset($result)) {
            $this->setTokens($result);
            $this->school = $this->tokenData->{'kreta:institute_code'};
            $this->id = $this->tokenData->{'kreta:institute_user_id'};
            $this->timetable = (object) [];
        }
        if(isset($keys['hash'])) {
            $this->hash = $keys['hash'];
            $this->encryptionKey = $keys['key'];
            $this->rme = true;
        } else if($keys['rme'] ?? false) {
            $this->rme = true;
            $this->hash = Str::random(60);
            $this->encryptionKey = Encrypter::generateKey(config('app.cipher'));
            DB::table('tokens')->insert(
                ['kreta_id' => $this->getAuthIdentifier(), 'remember_token' => $this->hash, 'access_token' => $this->encrypt($this->access_token) , 'refresh_token' => $this->encrypt($this->refresh_token)]
            );
        } else {
            $this->rme = false;
        }
    }

    private function setTokens($result) {
        $this->access_token = $result->access_token;
        $this->refresh_token = $result->refresh_token;
        $this->tokenData = $this->decompileToken();
        $this->save();
    }

    public static function fromCredentials($school, $username, $password, $rme = false) {
        $response = KretaApi::logIn($school, $username, $password);
        return isset($response->error) ?
                null :
                new User($response, ['rme' => $rme]);
    }
    /**
     * @return  string
     */
    public function getAuthIdentifierName()
    {
       return 'kreta_id';
    }

    /**
     * @return  mixed
     */
    public function getAuthIdentifier()
    {
       return $this->tokenData->{'idp:user_id'};
    }

    /**
     * @return  string
     */
    public function getAuthPassword()
    {
       return sha1($this->id);
    }

    /**
     * @return  string
     */
    public function getRememberToken()
    {
        if($this->rme)
            return DB::table('tokens')->where('kreta_id', $this->getAuthIdentifier())->value('remember_token');
    }

    /**
     * @param    string  $value
     * @return  void
     */
    public function setRememberToken($value)
    {
        if($this->rme)
            DB::table('tokens')
                ->where($this->getAuthIdentifierName(), $this->getAuthIdentifier())
                ->update([$this->getRememberTokenName() => $value]);
    }
    public function getRememberTokenName()
    {
        // Return the name of the column / attribute used to store the "remember me" token
        return $this->rme;
    }
    public function stringify() {
        $attrs = [
            'id',
            'school',
            'timetable',
            'tokenData',
            'access_token',
            'refresh_token',
            'rme'
        ];
        $ret = [];
        foreach ($attrs as $value) {
            $ret[$value] = $this->{$value};
        }
        $ret['cookies'] = KretaApi::cookies();
        return json_encode($ret);
    }

    public function load($string) {
        $data = json_decode($string);
        foreach ($data as $key => $value) {
            if($key === 'cookies') {
                KretaApi::cookies($value);
            } else {
                $this->{$key} = $value;
            }
        }
    }

    public function loadHirdetmenyek($class) {
        return KretaApi::getHirdetmenyek($class);
    }

    public function loadClassAverages() {
        return KretaApi::getClassAverages($this->school, $this->getToken());
    }

    public function loadEvents() {
        return KretaApi::getEvents($this->school, $this->getToken());
    }

    public function loadData() {
        return KretaApi::getStudent($this->school, $this->getToken());
    }

    public function getTimetable($from, $to, $group = true) {
        $ret = KretaApi::timetable($this->school, $this->getToken(), $from, $to, $group);
        $this->timetable->{"${from}-${to}-${group}"} = $ret;
        return $ret;
    }

    public function decompileToken() {
        return json_decode(
            base64_decode(
                explode('.', $this->access_token)[1]
            )
        );
    }

    public function getToken() {
        if($this->doRefreshToken()) {
            $this->refreshToken();
        }
        return $this->access_token;
    }

    private function encrypt($string) {

        $enc = new Encrypter($this->encryptionKey, config('app.cipher'));
        return $enc->encrypt( $string );
    }

    private function refreshToken() {
        try {
            $result = KretaApi::getToken($this->school, $this->refresh_token);
        } catch(\GuzzleHttp\Exception\ClientException $e) {
            sleep(0.5);
            $user = Auth::user();
            if($user->refresh_token !== $this->refresh_token) {
                $this->setTokens([
                    'access_token' => $user->access_token,
                    'refresh_token' => $user->refresh_token,
                ]);
            } else {
                auth()->logout();
                return null;
            }
        }
        $this->setTokens($result);
        if($this->rme)
            DB::table('tokens')
                ->where([$this->getAuthIdentifierName() => $this->getAuthIdentifier(), 'remember_token' => $this->hash])
                ->update(['access_token' => $this->encrypt($this->access_token), 'refresh_token' => $this->encrypt($this->refresh_token)]);
    }

    private function doRefreshToken() {
        return $this->tokenData->exp < time();
    }

    public function getJWTIdentifier()
    {
        return $this->rme ? ['hash' => $this->hash, 'key' => 'base64:'.base64_encode($this->encryptionKey), 'id' => $this->getAuthIdentifier()] : $this->getAuthIdentifier();
    }

    public function getJWTCustomClaims()
    {
      return [];
    }

    public function save()
    {
        if(!$this->rme) Session::put('user', $this->stringify());
    }
}
