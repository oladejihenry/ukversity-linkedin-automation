<?php
// app/Services/LinkedInService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

class LinkedInService
{
    private const RATE_LIMIT_KEY = 'linkedin_rate_limit:';
    private const TOKEN_REFRESH_WINDOW = 900; // 15 minutes in seconds
    private const POST_URL = 'https://api.linkedin.com/v2/ugcPosts';
    
    public function refreshTokenIfNeeded(User $user): bool
    {
        if (!$user->linkedin_access_token) {
            return false;
        }

        // Check if token expires within 15 minutes
        if ($user->linkedin_token_expires_at && 
            $user->linkedin_token_expires_at->isFuture()) {
            return true;
        }


        if (!$user->linkedin_refresh_token) {
            Log::warning('No refresh token available for user', [
                'user_id' => $user->id
            ]);
            return false;
        }

        return $this->refreshAccessToken($user);
    }

    private function refreshAccessToken(User $user): bool
    {
        try {
            $response = Http::asForm()->post('https://www.linkedin.com/oauth/v2/accessToken', [
                'grant_type' => 'refresh_token',
                'refresh_token' => $user->linkedin_refresh_token,
                'client_id' => config('services.linkedin.client_id'),
                'client_secret' => config('services.linkedin.client_secret'),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                $user->update([
                    'linkedin_access_token' => $data['access_token'],
                    'linkedin_token_expires_at' => now()->addSeconds($data['expires_in']),
                    'linkedin_refresh_token' => $data['refresh_token'] ?? $user->linkedin_refresh_token,
                ]);

                return true;
            }

            Log::error('Failed to refresh LinkedIn token', [
                'user_id' => $user->id,
                'response' => $response->json()
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('Exception refreshing LinkedIn token', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function postArticle(string $title, string $content, User $user): array
    {
        // Check rate limiting
        $rateLimitKey = self::RATE_LIMIT_KEY . $user->id;
        if (Cache::has($rateLimitKey)) {
            throw new \Exception('Rate limit in effect. Please try again later.');
        }

        try {
            // if (!$this->refreshTokenIfNeeded($user)) {
            //     throw new \Exception('LinkedIn authentication failed. Please reconnect your account.');
            // }

            $postData = [
                'author' => "urn:li:person:{$user->linkedin_person_id}",
                'lifecycleState' => 'PUBLISHED',
                'specificContent' => [
                    'com.linkedin.ugc.ShareContent' => [
                        'shareCommentary' => [
                            'text' => $this->formatContent($title, $content)
                        ],
                        'shareMediaCategory' => 'NONE'
                    ]
                ],
                'visibility' => [
                    'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$user->linkedin_access_token}",
                'Content-Type' => 'application/json',
                'X-Restli-Protocol-Version' => '2.0.0',
            ])->post(self::POST_URL, $postData);

            if ($response->successful()) {
                $result = $response->json();
                return [
                    'success' => true,
                    'post_id' => $result['id'] ?? null,
                    'external_request_id' => $response->header('X-Li-Response-Id')
                ];
            }

            // Handle rate limiting
            if ($response->status() === 429) {
                $retryAfter = (int) $response->header('Retry-After', 60);
                Cache::put($rateLimitKey, true, now()->addSeconds($retryAfter));
                throw new \Exception("Rate limit exceeded. Please try again in {$retryAfter} seconds.");
            }

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Failed to post to LinkedIn',
                'external_request_id' => $response->header('X-Li-Response-Id')
            ];

        } catch (\Exception $e) {
            Log::error('Exception posting to LinkedIn', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }



    public function postArticleWithVideo(string $title, string $content, string $videoUrl, User $user): array
    {
        try {
            $videoContent = Storage::disk('spaces')->get($videoUrl);
            // First register the video upload
            $registerResponse = Http::withHeaders([
                'Authorization' => "Bearer {$user->linkedin_access_token}",
                'X-Restli-Protocol-Version' => '2.0.0'
            ])->post('https://api.linkedin.com/v2/assets?action=registerUpload', [
                'registerUploadRequest' => [
                    'owner' => "urn:li:person:{$user->linkedin_person_id}",
                    'recipes' => [
                        'urn:li:digitalmediaRecipe:feedshare-video'
                    ],
                    'serviceRelationships' => [
                        [
                            'identifier' => 'urn:li:userGeneratedContent',
                            'relationshipType' => 'OWNER'
                        ]
                    ]
                ]
            ]);

            if (!$registerResponse->successful()) {
                throw new \Exception('Failed to register video upload: ' . $registerResponse->body());
            }

            $uploadData = $registerResponse->json();
            $uploadUrl = $uploadData['value']['uploadMechanism']['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']['uploadUrl'];
            $asset = $uploadData['value']['asset'];

            // Download video from DO and upload to LinkedIn
            $uploadResponse = Http::withToken($user->linkedin_access_token)->withBody(file_get_contents($videoUrl), "application/octet-    stream")
                ->put($uploadUrl);

            if (!$uploadResponse->successful()) {
                throw new \Exception('Failed to upload video: ' . $uploadResponse->body());
            }

            // Create post with video
            $postData = [
                'author' => "urn:li:person:{$user->linkedin_person_id}",
                'lifecycleState' => 'PUBLISHED',
                'specificContent' => [
                    'com.linkedin.ugc.ShareContent' => [
                        'shareCommentary' => [
                            'text' => $this->formatContent($title, $content)
                        ],
                        'shareMediaCategory' => 'VIDEO',
                        'media' => [
                            [
                                'status' => 'READY',
                                'media' => $asset,
                                'title' => [
                                    'text' => $title
                                ]
                            ]
                        ]
                    ]
                ],
                'visibility' => [
                    'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'
                ]
            ];

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$user->linkedin_access_token}",
                'Content-Type' => 'application/json',
                'X-Restli-Protocol-Version' => '2.0.0',
            ])->post(self::POST_URL, $postData);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'post_id' => $response->json()['id'] ?? null,
                    'external_request_id' => $response->header('X-Li-Response-Id')
                ];
            }

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Failed to post to LinkedIn',
                'external_request_id' => $response->header('X-Li-Response-Id')
            ];

            // ... rest of the method
        } catch (\Exception $e) {
            Log::error('Exception posting to LinkedIn with video', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function formatContent(string $title, string $content): string
    {
        // Clean and format content for LinkedIn
        $cleanContent = strip_tags($content);
        $cleanContent = preg_replace('/\s+/', ' ', $cleanContent);
        
        // LinkedIn has a character limit, so we need to truncate if necessary
        $maxLength = 3000; // LinkedIn's limit is around 3000 characters
        
        $formattedContent = "#{$title}\n\n{$cleanContent}";
        
        if (strlen($formattedContent) > $maxLength) {
            $formattedContent = substr($formattedContent, 0, $maxLength - 3) . '...';
        }
        
        return $formattedContent;
    }
}