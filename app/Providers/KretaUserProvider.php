<?php
namespace App\Providers;
use App\User;
use Illuminate\Contracts\Auth\UserProvider as IlluminateUserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use Session;
use DB;

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
        $usr = new User();
        $usr->load(Session::get('user'));
        if($usr->id == $identifier) return $usr;
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
        $results = DB::table('users')->select('*')->where([
            ['uid',$identifier],
            ['token', $token]])->get();
        return $results[0];
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
        DB::table('rme')
        ->where($user->getAuthIdentifierName(), $user->getAuthIdentifier())
        ->update([$user->getRememberTokenName() => $token]);
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