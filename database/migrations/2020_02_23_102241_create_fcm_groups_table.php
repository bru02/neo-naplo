<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Query\Expression;

class CreateFcmGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('fcm_groups', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->bigInteger('user_id');
            $table->string('notification_key', 150);
            $table->timestamp('evaluation_creating_time', 0)->default(new Expression("CURRENT_TIMESTAMP") );	
            $table->timestamp('absence_creating_time', 0)->default(new Expression("CURRENT_TIMESTAMP"));	
            $table->timestamp('note_creating_time', 0)->default(new Expression("CURRENT_TIMESTAMP"));	
            $table->json('absences_bejustified')->default(new Expression("('[]')"));
            $table->json('events')->default(new Expression("('[]')"));
            $table->json('changed_lessons')->default(new Expression("('[]')"));
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('fcm_groups');
    }
}
