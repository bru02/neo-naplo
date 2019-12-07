<?php

use Illuminate\Http\Request;

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
Route::group(['middleware' => 'jwt.auth'], function(){
    Route::any('/general', 'eFilcController@generalApi');
    Route::any('/timetable', 'eFilcController@timetableApi');
});

Route::post('/refresh')->middleware('jwt.refresh');
Route::post('/login', 'AuthController@login')->middleware('api');
Route::any('/logout', 'AuthController@logout')->middleware('api');


Route::get('/schools', 'eFilcController@schoolsApi');