<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

function _run($cmd) {
    $process = new Process($cmd);
    $process->setTimeout(3600);
    $process->run();

    // executes after the command finishes
    if (!$process->isSuccessful()) {
        throw new ProcessFailedException($process);
    }

    return $process->getOutput();
}

class Deploy extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deploy:git {v}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deploy app to git';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $v = $this->argument('v');
        $this->setPackageValue('version', $v);
        $this->setEnvironmentValue('APP_VERSION', $v);

        _run('npm run dev');
        _run('npm run prod');
        // _run(["git tag -s v$v"]);
        // _run("sentry-cli releases finalize \"v$v\"");
    }

    public function setEnvironmentValue(string $envKey, $envValue)
    {

        $envFile = app()->environmentFilePath();
        $str = file_get_contents($envFile). "\n"; // In case the searched variable is in the last line without \n
        $keyPosition = strpos($str, "{$envKey}=");
        $endOfLinePosition = strpos($str, "\n", $keyPosition);
        $oldLine = substr($str, $keyPosition, $endOfLinePosition - $keyPosition);

        // If key does not exist, add it
        if (!$keyPosition || !$endOfLinePosition || !$oldLine) {
            $str .= "{$envKey}={$envValue}\n";
        } else {
            $str = str_replace($oldLine, "{$envKey}={$envValue}", $str);
        }

        $str = substr($str, 0, -1);
        if (!file_put_contents($envFile, $str)) return false;
        return true;

    }

    public function setPackageValue(string $key, $val)
    {

        $packageFile = __DIR__ . '../../../package.json';
        $config = json_decode(
            file_get_contents($packageFile)
        );
        $config->{$key} = $val;
        if (!file_put_contents($packageFile, json_encode($config))) return false;
        return true;

    }
}
