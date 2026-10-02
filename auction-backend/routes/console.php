<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
Schedule::command('app:close-expired-auctions')->everyMinute();
Schedule::command('app:delete-old-closed-auctions')->daily();
Schedule::command('app:activate-pending-auctions')->everyMinute();