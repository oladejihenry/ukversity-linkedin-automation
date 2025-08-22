<?php

namespace App\Jobs;

use App\Models\Article;
use App\Services\VideoGenerationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateLinkedInVideo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 900;
    private $article;
    private const MAX_POLLING_ATTEMPTS = 60;
    private const POLLING_INTERVAL = 10;

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
    public function handle(VideoGenerationService $videoService)
    {
        try{
            $this->article->update(['video_status' => 'processing']);

            $videoGeneration = $videoService->generateVideo($this->article->content);
            $videoId = $videoGeneration['video_id'];

            $this->article->update([
                'video_id' => $videoId,
                'video_status' => 'pending'
            ]);

            Log::info('Video generation initiated', [
                'article_id' => $this->article->id,
                'video_id' => $videoId
            ]);
        } catch (\Exception $e) {
            Log::error('Video generation failed', [
                'article_id' => $this->article->id,
                'error' => $e->getMessage()
            ]);
            $this->article->update([
                'video_status' => 'failed',
                'video_error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    public function release($delay = 0)
    {
        $releaseDelay = min(900, pow(2, $this->attempts()) * 60);
        $this->release($releaseDelay);
    }
}
