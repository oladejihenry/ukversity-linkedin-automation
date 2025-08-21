<?php

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', fn (Request $request) => new UserResource($request->user()));

    //Articles
    Route::apiResource('articles', ArticleController::class);
});

