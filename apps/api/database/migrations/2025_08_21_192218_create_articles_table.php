<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->string('status')->default('draft');
            $table->dateTime('scheduled_for')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->string('linkedin_post_id')->nullable();
            $table->timestamp('linkedin_posted_at')->nullable();
            $table->text('linkedin_error_message')->nullable();
            $table->timestamp('publishing_lock_until')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
