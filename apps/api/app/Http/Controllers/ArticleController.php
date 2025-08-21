<?php

namespace App\Http\Controllers;

use App\Http\Requests\ArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\Request;
use App\Services\LinkedInService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ArticleController extends Controller
{

    public function __construct(private LinkedInService $linkedinService){}
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $articles = Article::where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->paginate(10);

        return ArticleResource::collection($articles);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ArticleRequest $request)
    {
        $user = $request->user();
        if (in_array($request->status, ['published', 'scheduled']) && !$user->linkedin_access_token) {
            return response()->json([
                'message' => 'LinkedIn account must be connected to publish articles.',
                'linkedin_connected' => false
            ], 422);
        }

        return DB::transaction(function() use($request, $user){

        
            $article = Article::create([
                'title' => $request->title,
                'content' => $request->content,
                'status' => $request->status,
                'scheduled_for' => $request->scheduled_for,
                'scheduled_at' => $request->scheduled_at,
                'user_id' => $user->id,
            ]);

            //Handle instant publishing
            if($request->status === 'published'){
                try{

                    $result = $this->linkedinService->postArticle(
                        $article->title,
                        $article->content,
                        $user
                    );

                    if($result['success']){
                        $article->update([
                            'linkedin_post_id' => $result['post_id'],
                            'linkedin_posted_at' => now(),
                        ]);

                        Log::info('Article published instantly to LinkedIn', [
                            'article_id' => $article->id,
                            'post_id' => $result['post_id']
                        ]);
                    }else{
                        $article->update([
                            'status' => 'draft',
                            'linkedin_error_message' => $result['error']
                        ]);

                        Log::error('Failed to publish article instantly', [
                            'article_id' => $article->id,
                            'error' => $result['error']
                        ]);

                        return response()->json([
                            'message' => 'Failed to publish to LinkedIn: ' . $result['error'],
                            'article' => new ArticleResource($article)
                        ], 422);
                    }
                }catch(Exception $e){
                    $article->update([
                        'status' => 'draft',
                        'linkedin_error_message' => $e->getMessage()
                    ]);

                    Log::error('Exception publishing article instantly', [
                        'article_id' => $article->id,
                        'error' => $e->getMessage()
                    ]);

                    return response()->json([
                        'message' => 'Failed to publish to LinkedIn: ' . $e->getMessage(),
                        'article' => new ArticleResource($article)
                    ], 422);
                }
            }

            if ($request->status === 'scheduled' && $request->scheduled_for) {
                Log::info('Article scheduled for LinkedIn posting', [
                    'article_id' => $article->id,
                    'scheduled_for' => $request->scheduled_for
                ]);
            }

            return new ArticleResource($article);
        });

        
    }

    /**
     * Display the specified resource.
     */
    public function show(Article $article)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Article $article)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Article $article)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Article $article)
    {
        //
    }
}
