<?php
namespace App\Providers;
use App\User;
use Illuminate\Contracts\Auth\UserProvider as IlluminateUserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Str;

class KretaUserProvider implements IlluminateUserProvider
{

    protected function guard()
    {
        return Auth::guard('web');
    }
    /**
     * Retrieve a user by their unique identifier.
     *
     * @param  mixed  $identifier
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function retrieveById($identifier)
    {
        $user = DB::table('tokens')->select('*')->where([
            ['kreta_id', $identifier->id],
            ['remember_token', $identifier->hash]])->first();
        if(!isset($user)) {
            return null;
        }
        if (Str::startsWith($key = $identifier->key, 'base64:')) {
            $key = base64_decode(substr($key, 7));
        }
        $enc = new Encrypter($key, config('app.cipher'));
        return new User((object)[
            'access_token' => $enc->decrypt( $user->access_token),
            'refresh_token' => $enc->decrypt($user->refresh_token)
        ], [
            'hash' =>$identifier->hash,
            'key' => $key
        ]);
    }

    /**
     * Retrieve a user by their unique identifier and "remember me" token.
     *
     * @param  mixed  $identifier
     * @param  string  $token
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function retrieveByToken($identifier, $token)
    {
        return 'No.';
    }

    /**
     * Update the "remember me" token for the given user in storage.
     *
     * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
     * @param  string  $token
     * @return void
     */
    public function updateRememberToken(Authenticatable $user, $token)
    {
        $user->setRememberToken($token);
    }

    /**
     * Retrieve a user by the given credentials.
     *
     * @param  array  $credentials
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function retrieveByCredentials(array $credentials)
    {
        if (empty($credentials) ||
           (count($credentials) === 1 &&
            array_key_exists('password', $credentials))) {
            return;
        }
        return User::fromCredentials(
            $credentials['school'],
            $credentials['username'],
            $credentials['password']
        );
    }


    /**
     * Validate a user against the given credentials.
     *
     * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
     * @param  array  $credentials
     * @return bool
     */
    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        $user->save();
        return true;
    }
}