<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::view('/', 'router');
Route::view('/absences', 'router');
Route::view('/notes', 'router');
Route::view('/evaluations', 'router');
Route::view('/timetable', 'router');
Route::view('/statistics', 'router');

Route::view('/timetable-skeleton-dev', 'skeleton');

Route::view('/login', 'router');

Route::any('manifest', 'eFilcController@manifest');