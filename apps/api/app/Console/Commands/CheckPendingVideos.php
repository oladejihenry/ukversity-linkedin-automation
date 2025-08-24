<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Notifications\VideoGenerationCompleted;
use App\Services\VideoGenerationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckPendingVideos extends Command
{
    protected $signature = 'videos:check-pending';
    protected $description = 'Check status of pending videos and update when complete';

    /**
     * Execute the console command.
     */
    public function handle(VideoGenerationService $videoService)
    {
        $pendingVideos = Article::where('video_status', 'pending')
            ->whereNotNull('video_id')
            ->get();
        Log::info('Checking pending videos', [
            'count' => $pendingVideos->count()
        ]);

        foreach ($pendingVideos as $article) {
            try{
                $response = $videoService->checkVideoStatus($article->video_id);
                if ($response['status'] === 'completed' && $response['video_url']) {
                    // Store video in DO Spaces
                    $storedVideoUrl = $videoService->storeVideo($response['video_url']);
                    
                    $article->update([
                        'video_url' => $storedVideoUrl,
                        'video_status' => 'completed',
                        'video_error_message' => null
                    ]);

                    $article->user->notify(new VideoGenerationCompleted($article));

                    Log::info('Video processing completed', [
                        'article_id' => $article->id,
                        'video_url' => $storedVideoUrl
                    ]);
                } elseif ($response['status'] === 'failed') {
                    $article->update([
                        'video_status' => 'failed',
                        'video_error_message' => $response['error'] ?? 'Video generation failed'
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error checking video status', [
                    'video_id' => $article->video_id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }
}
