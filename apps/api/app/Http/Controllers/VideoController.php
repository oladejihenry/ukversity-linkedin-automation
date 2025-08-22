<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use App\Services\VideoGenerationService;
use App\Jobs\GenerateLinkedInVideo;

class VideoController extends Controller
{
    public function __construct(private VideoGenerationService $videoService)
    {}
    public function generate(Request $request)
    {
        try {
            // $user = $request->user();

            $article = Article::findOrFail($request->article_id);

            $article->update([
                'video_status' => 'pending'
            ]);

            GenerateLinkedInVideo::dispatch($article);

            return response()->json([
                'success' => true,
                'message' => 'Video generation started',
                'article' => $article
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate video: ' . $e->getMessage()
            ], 500);
        }
    }
}
