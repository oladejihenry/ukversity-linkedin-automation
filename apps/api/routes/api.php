<?php

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\LinkedInAIPromptGeneratorController;
use App\Http\Controllers\LinkedInController;
use App\Http\Controllers\VideoController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', fn (Request $request) => new UserResource($request->user()));

    //Articles
    Route::apiResource('articles', ArticleController::class);

    //LinkedIn
    Route::prefix('linkedin')->group(function () {
        Route::post('/disconnect', [LinkedInController::class, 'disconnect']);
        Route::get('/status', [LinkedInController::class, 'status']);
    });

    //AI
    Route::prefix('ai')->group(function () {
        Route::post('/generate', LinkedInAIPromptGeneratorController::class);
    });

    //Video
    Route::prefix('video')->group(function () {
        Route::post('/generate', [VideoController::class, 'generate']);
    });
});

Route::prefix('linkedin')->group(function () {
    Route::get('/redirect', [LinkedInController::class, 'redirect']);
    Route::get('/callback', [LinkedInController::class, 'callback']);
});
