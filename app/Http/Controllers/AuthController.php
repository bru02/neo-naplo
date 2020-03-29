<?php

namespace App\Http\Controllers;

use Tymon\JWTAuth\Exceptions\JWTException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login']]);
    }

    public function username()
    {
        return 'username';
    }

    /**
     * Update the user's profile.
     *
     * @param  Request  $request
     * @return Response
     */
    public function update(Request $request)
    {
        // $request->user() returns an instance of the authenticated user...
    }

    /**
     * Handle an authentication attempt.
     *
     * @param  \Illuminate\Http\Request $request
     *
     * @return Response
     */
    public function login(Request $request)
    {
        $credentials = $request->only('school', 'username', 'password', 'rme');

        if (! $token = auth()->attempt($credentials)) {
            return response([
                'error' => 'Rossz felhasználónév / jelszó!'
            ], 401);
        }
        return $this->respondWithToken($token);
    }

    protected function validateLogin(Request $request)
    {
        $this->validate($request, [
            'school' => 'required',
            'username' => 'required',
            'password' => 'required',
            'rme' => 'nullable|boolean'
        ]);
    }

        /**
     * Get the needed authorization credentials from the request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    protected function credentials(Request $request)
    {
        return $request->only($this->username(), 'school', 'password');
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => auth()->factory()->getTTL() * 60
        ]);
    }

    public function refreshToken(Request $request) {
        // try {
            return response()->json(['access_token' => auth()->setRequest($request)
            ->parseToken()
            ->refresh()
        ]);
        // } catch (JWTException $exception) {
        //     throw new UnauthorizedHttpException('jwt-auth', $exception->getMessage(), $exception, $exception->getCode());
        // }
    }
    public function logout()
    {
        Auth::logout();
        return response([
                'status' => 'success',
                'msg' => 'Sikeresen kiléptél!'
        ], 200);
    }
}
