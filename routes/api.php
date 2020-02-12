<?php

use Tymon\JWTAuth\Exceptions\JWTException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::group(['middleware' => 'jwt.auth'], function() {
    Route::any('/general', 'eFilcController@generalApi');
    Route::any('/timetable', 'eFilcController@timetableApi');
});

Route::post('/refresh', function () {
    try {
        return response()->json(['access_token' => auth()->refresh()]);
    } catch (JWTException $exception) {
        throw new UnauthorizedHttpException('jwt-auth', $exception->getMessage(), $exception, $exception->getCode());
    }
});
Route::post('/login', 'AuthController@login')->middleware('api');
Route::any('/logout', 'AuthController@logout')->middleware('api');


Route::get('/schools', 'eFilcController@schoolsApi');
