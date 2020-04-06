<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use GuzzleHttp\Exception\BadResponseException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Exception  $exception
     * @return void
     */
     public function report(Exception $exception)
     {
         if (app()->bound('sentry') && $this->shouldReport($exception)){
            if($exception instanceof BadResponseException)
                app('sentry')->captureMessage($exception->getResponse()->getBody()->getContents());

             app('sentry')->captureException($exception);
         }
        //::addThrowable($exception);
        parent::report($exception);
     }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    public function render($request, Exception $exception)
    {
        if ($exception instanceof Tymon\JWTAuth\Exceptions\TokenExpiredException) {
          return response()->json(['token_expired'], $exception->getStatusCode());
        } 
        if ($exception instanceof Tymon\JWTAuth\Exceptions\TokenInvalidException) {
          return response()->json(['token_invalid'], $exception->getStatusCode());
        }

        return parent::render($request, $exception);
    }
}
