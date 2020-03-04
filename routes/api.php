<?php

use App\Jobs\SendNotifications;
use App\KretaApi;

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
    Route::any('/events', 'eFilcController@eventsApi');
    Route::any('/classAverages', 'eFilcController@classAveragesApi');
    Route::any('/hirdetmenyek/{class}', 'eFilcController@hirdetmenyekApi');
    Route::put('/notifications/token', 'eFilcController@updateToken');
    Route::delete('/notifications/token', 'eFilcController@deleteToken');
    Route::any('/test', function () {
        $user = request()->user('api');

        $data = isset($user->data) ? $user->data : $user->loadData();

        return response()->json([
            'events' => SendNotifications::events(
                $user->loadEvents(),
                $user->school,
                $data->osztalyCsoportok
            ),
            'changed_lessons' =>SendNotifications::changedLessons(
                $user->getTimeTable(
                    strtotime('last sunday'),
                    strtotime('next saturday'),
                    false
                )
            ),
            'absences_bejustified' =>SendNotifications::absencesBejustified(
                $data->absences
            ),

        ]);
    });
});

Route::post('/refresh', 'AuthController@refreshToken');
Route::post('/login', 'AuthController@login')->middleware('api');
Route::any('/logout', 'AuthController@logout')->middleware('api');


Route::get('/schools', 'eFilcController@schoolsApi');
