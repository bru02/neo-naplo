<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <base href='{{ url('/') }}/'>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="manifest" href="{{ url('manifest') }}">
    <title>{{ config('app.name') }}</title>
    <link href="{{ asset(mix('app.css')) }}" rel="stylesheet">
</head>
<body>
    @yield('content')
</body>
<script src="{{ asset(mix('app.js')) }}"></script>
</html>