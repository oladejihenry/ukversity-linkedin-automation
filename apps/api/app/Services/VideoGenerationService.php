<?php
namespace App\Services;

use App\Jobs\GenerateLinkedInVideo;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VideoGenerationService
{
    private string $baseUrl = "https://api.heygen.com/v2";
    private string $v1BaseUrl = "https://api.heygen.com/v1";
    private string $secretKey;

    public function __construct()
    {
        $this->secretKey = config('services.heygen.api_key');
    }



    public function generateVideo(string $content)
    {
        try {
            // Start video generation
            $response = Http::withHeaders([
                'x-api-key' => $this->secretKey,
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/video/generate', [
                'title' => 'LinkedIn Post Video',
                'video_inputs' => [
                    [
                        'character' => [
                            'type' => 'avatar',
                            'avatar_id' => config('services.heygen.avatar_id'),
                            'avatar_style' => 'normal'
                        ],
                        'voice' => [
                            'type' => 'text',
                            'input_text' => $this->formatVideoScript($content),
                            'voice_id' => config('services.heygen.voice_id')
                        ]
                    ]
                ],
                'dimension' => [
                    'width' => 1280,
                    'height' => 720
                ],
                'test' => false
            ]);

            if (!$response->successful()) {
                Log::error('HeyGen video generation failed', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                throw new \Exception('Failed to start video generation: ' . $response->body());
            }

            $videoData = $response->json();
            Log::info('HeyGen video generation started', [
                'video_id' => $videoData['data']['video_id'] ?? null
            ]);

            // Poll for video completion
            // $videoUrl = $videoData['data']['video_url'];
            // Log::info('HeyGen video generation completed', [
            //     'video_url' => $videoUrl
            // ]);
            //Dispatch job to store video
            // GenerateLinkedInVideo::dispatch($videoUrl);
            return [
                'video_id' => $videoData['data']['video_id'],
                'status' => 'pending'
            ];

        } catch (\Exception $e) {
            Log::error('Video generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function pollForCompletion(string $videoId, int $maxAttempts = 60, int $initialDelay = 10)
    {
        $attempts = 0;
        $delay = $initialDelay;
        while ($attempts < $maxAttempts) {
            $response = Http::withHeaders([
                'X-Api-Key' => $this->secretKey
            ])->get($this->v1BaseUrl . '/video_status.get?video_id=' . $videoId);

            if (!$response->successful()) {
                Log::error('HeyGen video status check failed', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                throw new \Exception("Status check failed: HTTP ".$response->status()." - ".$response->body());
            }

            $data = $response->json();
            $status = $data['data']['status'] ?? null;
            $videoUrl = $data['data']['video_url'] ?? null;

            // Log the status for debugging
            Log::info('HeyGen video status check', [
                'video_id' => $videoId,
                'status' => $status,
                'attempt' => $attempts + 1,
                'next_delay' => $delay
            ]);
            
            switch ($status) {
                case 'completed':
                    if ($videoUrl) {
                        Log::info('Video generation completed successfully', [
                            'video_id' => $videoId,
                            'video_url' => $videoUrl,
                            'total_attempts' => $attempts + 1,
                            'total_time' => ($attempts + 1) * $delay
                        ]);
                        return [
                            'video_url' => $videoUrl,
                            'status' => 'completed'
                        ];
                    }
                    throw new \Exception('Video completed but URL not found');
                    
                case 'failed':
                    throw new \Exception('Video generation failed: ' . ($data['data']['error'] ?? 'Unknown error'));
                    
                case 'processing':
                    $delay = min(60, $delay * 1.5);
                    break;

                case 'pending':
                case 'waiting':
                    $delay = $initialDelay;
                    // Continue polling
                    break;
                    
                default:
                    Log::warning('Unknown video status', [
                        'video_id' => $videoId,
                        'status' => $status
                    ]);
                    $delay = $initialDelay;
            }

            $attempts++;
            if ($attempts < $maxAttempts) {
                sleep($delay);
            }
        }

        Log::error('Video generation polling timed out', [
            'video_id' => $videoId,
            'total_attempts' => $attempts,
            'total_time_seconds' => array_sum(range($initialDelay, $delay))
        ]);

        throw new \Exception(
            "Video generation timed out after {$attempts} attempts. " .
            "Please check video status manually with ID: {$videoId}"
        );
    }

    public function checkVideoStatus(string $videoId): array
    {
        try {
            $response = Http::withHeaders([
                'X-Api-Key' => $this->secretKey
            ])->get($this->v1BaseUrl . '/video_status.get?video_id=' . $videoId);

            if (!$response->successful()) {
                throw new \Exception("Status check failed: " . $response->body());
            }

            $data = $response->json();
            $status = $data['data']['status'] ?? null;
            $videoUrl = $data['data']['video_url'] ?? null;

            Log::info('Video status check', [
                'video_id' => $videoId,
                'status' => $status
            ]);

            return [
                'status' => $status,
                'video_url' => $videoUrl,
                'error' => $data['data']['error'] ?? null
            ];

        } catch (\Exception $e) {
            Log::error('Failed to check video status', [
                'video_id' => $videoId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function storeVideo(string $videoUrl)
    {
        try {
            // Download video from HeyGen
            $videoContent = Http::get($videoUrl)->body();

            // Generate a unique filename
            $filename = 'videos/' . date('Y/m/d') . '/' . Str::uuid() . '.mp4';
            
            // Store on DigitalOcean Spaces
            Storage::disk('spaces')->put($filename, $videoContent, 'public');
            
            // Get the full URL
            $spacesUrl = rtrim(config('filesystems.disks.spaces.url'), '/');
            return $spacesUrl . '/' . $filename;

        } catch (\Exception $e) {
            Log::error('Failed to store video', [
                'error' => $e->getMessage(),
                'video_url' => $videoUrl
            ]);
            throw new \Exception('Failed to store video: ' . $e->getMessage());
        }
    }

    private function formatVideoScript(string $content)
    {
        // Clean and format content for video script
        $cleanContent = strip_tags($content);
        $cleanContent = preg_replace('/\s+/', ' ', $cleanContent);
        
        // Add natural pauses and structure
        $formattedScript = "Hi! Let me share this interesting content with you.\n\n" . 
                          $cleanContent . "\n\n" .
                          "Thanks for watching!";
        
        return $formattedScript;
    }
}