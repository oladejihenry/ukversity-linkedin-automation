<?php

namespace App\Console\Commands;

use App\Jobs\PostArticleToLinkedIn;
use App\Models\Article;
use Illuminate\Console\Command;

class ProcessScheduledPosts extends Command
{
   protected $signature = 'articles:process-scheduled';
   protected $description = 'Process scheduled articles and post them to LinkedIn';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $articles = Article::where('status', 'scheduled')
            ->where('scheduled_for', '<=', now())
            ->where(function ($query) {
                $query->whereNull('linkedin_posted_at')
                    ->orWhereNull('linkedin_post_id');
            })
            ->get();

        foreach ($articles as $article) {
            PostArticleToLinkedIn::dispatch($article);
        }

        $this->info("Dispatched {$articles->count()} articles for posting");
    }
}
