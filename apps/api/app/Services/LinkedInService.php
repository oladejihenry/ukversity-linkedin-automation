<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\Article;
use App\Models\User;

use Exception;
use Illuminate\Support\Facades\Log;

class LinkedInService
{

    private const API_BASE_URL = 'https://api.linkedin.com/v2';
    private const UPLOAD_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';
    private const POST_URL = 'https://api.linkedin.com/v2/ugcPosts';

    public function refreshTokenIfNeeded(User $user): bool
    {
        if (!$user->linkedin_access_token) {
            return false;
        }

        // Check if token expires within 15 minutes
        if ($user->linkedin_token_expires_at && 
            $user->linkedin_token_expires_at->diffInMinutes(now()) <= 15) {
            
            return $this->refreshAccessToken($user);
        }

        return true;
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

                Log::info('LinkedIn token refreshed successfully', ['user_id' => $user->id]);
                return true;
            }

            Log::error('Failed to refresh LinkedIn token', [
                'user_id' => $user->id,
                'response' => $response->json()
            ]);
            return false;

        } catch (Exception $e) {
            Log::error('Exception refreshing LinkedIn token', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    public function postArticle(string $title, string $content, User $user): array
    {
        if (!$this->refreshTokenIfNeeded($user)) {
            throw new Exception('LinkedIn authentication failed. Please reconnect your account.');
        }

        try {
            // Create the post content
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
                Log::info('LinkedIn post created successfully', [
                    'user_id' => $user->id,
                    'post_id' => $result['id'] ?? null,
                    'external_request_id' => $response->header('X-Li-Response-Id')
                ]);

                return [
                    'success' => true,
                    'post_id' => $result['id'] ?? null,
                    'external_request_id' => $response->header('X-Li-Response-Id')
                ];
            }

            // Handle rate limiting
            if ($response->status() === 429) {
                $retryAfter = $response->header('Retry-After', 60);
                Log::warning('LinkedIn rate limit hit', [
                    'user_id' => $user->id,
                    'retry_after' => $retryAfter
                ]);
                
                throw new Exception("Rate limit exceeded. Please try again in {$retryAfter} seconds.");
            }

            Log::error('LinkedIn post failed', [
                'user_id' => $user->id,
                'status' => $response->status(),
                'response' => $response->json(),
                'external_request_id' => $response->header('X-Li-Response-Id')
            ]);

            return [
                'success' => false,
                'error' => $response->json()['message'] ?? 'Failed to post to LinkedIn',
                'external_request_id' => $response->header('X-Li-Response-Id')
            ];

        } catch (Exception $e) {
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

    public function getCallbackUrl(): string
    {
        return config('services.linkedin.redirect');
    }

    public function getAuthUrl(string $state): string
    {
        $params = [
            'response_type' => 'code',
            'client_id' => config('services.linkedin.client_id'),
            'redirect_uri' => $this->getCallbackUrl(),
            'state' => $state,
            'scope' => 'r_liteprofile r_emailaddress w_member_social',
        ];

        return 'https://www.linkedin.com/oauth/v2/authorization?' . http_build_query($params);
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