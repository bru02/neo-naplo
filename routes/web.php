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
Route::view('/', 'index');
Route::view('/absences', 'index');
Route::view('/notes', 'index');
Route::view('/evaluations', 'index');
Route::view('/timetable', 'index');
Route::view('/timetable/{week}', 'index');
Route::view('/statistics', 'index');
Route::view('/statistics/{subject}', 'index');
Route::view('/profile', 'index');


//Route::view('/timetable-skeleton-dev', 'skeleton');

Route::view('/login', 'index');

// Route::any('manifest', 'eFilcController@manifest');