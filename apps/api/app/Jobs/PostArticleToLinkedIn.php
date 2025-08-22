<?php

namespace App\Jobs;

use App\Models\Article;
use App\Services\LinkedInService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PostArticleToLinkedIn implements ShouldQueue
{
   use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

   public $tries = 3; 
   public $backoff = [60, 300, 900]; 

   private $article;


    /**
     * Create a new job instance.
     */
    public function __construct(Article $article)
    {
        $this->article = $article;
    }

    /**
     * Execute the job.
     */
    public function handle(LinkedInService $linkedinService): void
    {
        try {
            if ($this->article->linkedin_posted_at || $this->article->status !== 'scheduled') {
                Log::info('Article already posted or not scheduled', [
                    'article_id' => $this->article->id,
                    'status' => $this->article->status,
                    'posted_at' => $this->article->linkedin_posted_at
                ]);
                return;
            }

            $user = $this->article->user;

            if (!$user->linkedin_access_token) {
                throw new \Exception('LinkedIn token not found');
            }

            // if (!$linkedinService->refreshTokenIfNeeded($user)) {
            //     throw new \Exception('Failed to refresh LinkedIn token');
            // }
            $result = null;
            if ($this->article->video_status === 'completed' && $this->article->video_url) {
                $result = $linkedinService->postArticleWithVideo(
                    $this->article->title,
                    $this->article->content,
                    $this->article->video_url,
                    $user
                );
            } else {
                $result = $linkedinService->postArticle(
                $this->article->title,
                    $this->article->content,
                    $user
                );
            }

            if ($result['success']) {
                $this->article->update([
                    'status' => 'published',
                    'linkedin_post_id' => $result['post_id'],
                    'linkedin_posted_at' => now(),
                    'linkedin_error_message' => null,
                    'published_at' => now()
                ]);

                Log::info('Successfully posted scheduled article to LinkedIn', [
                    'article_id' => $this->article->id,
                    'post_id' => $result['post_id']
                ]);
            } else {
                throw new \Exception($result['error']);
            }
        } catch (\Exception $e) {
            Log::error('Failed to post article to LinkedIn', [
                'article_id' => $this->article->id,
                'error' => $e->getMessage()
            ]);

            $this->article->update([
                'linkedin_error_message' => $e->getMessage()
            ]);

            throw $e;
        }
    }

    public function failed(\Throwable $exception)
    {
        Log::error('LinkedIn posting job failed', [
            'article_id' => $this->article->id,
            'error' => $exception->getMessage()
        ]);

        $this->article->update([
            'linkedin_error_message' => $exception->getMessage()
        ]);
    }
}
