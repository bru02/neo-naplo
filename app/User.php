<?php
namespace App;

use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Log;
use Session;
use Jenssegers\Model\Model;

class User extends Model implements Authenticatable, JWTSubject
{
    protected $refresh_token;
    protected $access_token;
    protected $rme;

    public $school;
    public $data;
    public $toldyClassCode;
    public $id;
    public $timetable;

    private $tokenData;

    public function __construct($result = null)
    {
        if(isset($result)) {
            $this->access_token = $result->access_token;
            $this->refresh_token = $result->refresh_token;
            $this->tokenData = $this->decompileToken();
            $this->school = $this->tokenData->{'kreta:institute_code'};
            $this->id = $this->tokenData->{'kreta:institute_user_id'};
            $this->timetable = (object)[];
        }
    }

    public static function fromCredentials($school, $username, $password) {
        $response = KretaApi::logIn($school, $username, $password);
        return isset($response->error) ?
                null :
                new User($response);
    }
    /**
     * @return  string
     */
    public function getAuthIdentifierName()
    {
       return $this->id;
    }

    /**
     * @return  mixed
     */
    public function getAuthIdentifier()
    {
       return $this->id;
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
        return $this->rme;
    }

    /**
     * @param    string  $value
     * @return  void
     */
    public function setRememberToken($value)
    {
        $this->rme = $value;
    }

    /**
     * @return  string
     */
    public function getRememberTokenName()
    {
        // Return the name of the column / attribute used to store the "remember me" token
        return $this->rme;
    }

    public function stringify() {
        $attrs = [
            'rme',
            'id',
            'data',
            'school',
            'toldyClassCode',
            'timetable',
            'tokenData',
            'access_token',
            'refresh_token'
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
            if($key == 'cookies')
                KretaApi::cookies($value);
            else
                $this->{$key} = $value;
        }
    }

    public function loadData() {
        $data = KretaApi::getStudent($this->school, $this->getToken(), $this->toldyClassCode);
        $this->data = $data;
        return $data;
    }

    public function getTimetable($from, $to, $group = true) {
        $ret = KretaApi::timetable($this->school, $this->getToken(), $from, $to, $group);
        $this->timetable->{"$from-$to-$group"} = $ret;
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
        $this->log([
            'action' => __FUNCTION__,
            'caller' => debug_backtrace()[0],
            'access_token' => $this->access_token,
            'refresh_token' => $this->refresh_token,
            'timestamp' => time(),
            'exp' => $this->tokenData->exp
        ]);
        if($this->doRefreshToken())
            $this->refreshToken();
        return $this->access_token;
    }

    private function refreshToken() {
        $result = KretaApi::getToken($this->school, $this->refresh_token);
        $this->access_token = $result->access_token;
        $this->refresh_token = $result->refresh_token;
        $this->tokenData = $this->decompileToken();
        $this->log([
            'action' => __FUNCTION__,
            'caller' => debug_backtrace()[0],
            'access_token' => $this->access_token,
            'refresh_token' => $this->refresh_token,
            'timestamp' => time(),
            'exp' => $this->tokenData->exp
        ]);
    }

    private function doRefreshToken() {
        return $this->tokenData->exp < time();
    }

    private function log($what) {
        Log::debug("Action: $what[action], caller: , at: $what[access_token], rt: $what[refresh_token], exp: $what[exp]");
    }

    public function getJWTIdentifier()
    {
      return $this->getAuthIdentifier();
    }

    public function getJWTCustomClaims()
    {
      return [
          'usr' => [
              'id' => $this->tokenData->{'idp:user_id'},
              'role' => $this->tokenData->role
          ]
      ];
    }

    public function save() {
        Session::put('user', $this->stringify());
    }
}
