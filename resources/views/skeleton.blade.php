<?php
use GuzzleHttp\Client;

$headers = [
    'Origin' => 'https://klik035220001.e-kreta.hu',
    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Referer' => 'https://klik035220001.e-kreta.hu/Adminisztracio/Login',
    'Host' => 'klik035220001.e-kreta.hu'
];

$client = new Client([
    'cookies' => true,
    'debug' => true
]);
$client->get('https://klik035220001.e-kreta.hu/Adminisztracio/Login', ['headers' => $headers]);
$login = json_decode(
    $client->post('https://klik035220001.e-kreta.hu/Adminisztracio/Login/LoginCheck', [
        'json' => [
            'UserName' => 'salomon bruno robert',
            'Password' => 57131
        ],
        'headers' => $headers
    ])->getBody()
);

if($login->Success) {
    $client->get('https://idp.e-kreta.hu/account/logout');
    $client->request('GET','https://klik035220001.e-kreta.hu/Adminisztracio/SzerepkorValaszto', ['headers' => [
        'Upgrade-Insecure-Requests' => 1,
    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
    'Sec-Fetch-Mode' => 'navigate',
    'Sec-Fetch-User' => '?1',
    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Sec-Fetch-Site' => 'none',
    'Accept-Encoding' => 'gzip, deflate, br',
    'Accept-Language' => 'hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7,fr;q=0.6'
    ]]);

    exit();
    $timetable = json_decode(
        $client->get(('https://klik035220001.e-kreta.hu/api/CalendarApi/GetTanuloOrarend?tanarId=-1&osztalyCsoportId=-1&tanuloId=-1&teremId=-1&kellCsengetesiRendMegjelenites=false&csakOrarendiOra=false&kellTanoranKivuliFoglalkozasok=false&kellTevekenysegek=false&kellTanevRendje=true&szuresTanevRendjeAlapjan=false&start=2019-10-21&end=2019-10-26&_=' . round(microtime(true) * 1000)))->getBody()
    );
    print_r(
        $timetable
    );

}

?>
