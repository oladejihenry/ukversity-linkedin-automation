<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class LinkedInAIPromptGeneratorController extends Controller
{
    public function __invoke(Request $request)
    {
        // try{
        //     // $request->validate([
        //     //     'prompt' => 'required|string|min:30',
        //     // ]);

        //     $prompt = $request->input('prompt');
        //     Log::info($prompt);
        //     $currentTitle = $request->input('currentTitle');
        //     $currentContent = $request->input('currentContent');

        //     $response = OpenAI::chat()->create([
        //         'model' => 'gpt-4o',
        //         'temperature' => 0.8,
        //         'messages' => [
        //             [
        //                 'role' => 'system',
        //                 'content' => 'You are a professional content writer. Generate a title and content for a LinkedIn post. Return only JSON format with "title" and "content" keys. The title should be a single sentence and the content should be a paragraph. The content should be in the same language as the prompt.'
        //             ],
        //             [
        //                 'role' => 'user',
        //                 'content' => $prompt
        //             ],
        //         ],
        //         'temperature' => 0.7,
        //         'max_tokens' => 1000,
        //     ]);

        //     Log::info($response);

        //     $content = $response->choices[0]->message->content;

        //     $data = json_decode($content, true);

        //     if (json_last_error() !== JSON_ERROR_NONE) {
        //         $data = [
        //             'success' => true,
        //             'title' => $data['title'],
        //             'content' => $data['content']
        //         ];
        //     }

        //     return response()->json($data);
        // } catch (\Exception $e) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Error generating content',
        //     ], 500);
        // }


        $request->validate([
            'prompt' => 'required|string|min:30',
        ]);
        $prompt = $request->input('prompt');
        try{

            
            $fullPrompt = "You are a professional content writer. Generate a title and content for a LinkedIn post. 
                Return only JSON format with 'title' and 'content' keys. 
                The title should be a single sentence and the content should be a paragraph. 
                The content should be in the same language as the prompt.
                Example format: {\"title\": \"Your Title Here\", \"content\": \"Your content here\"}

                User request: {$prompt}";

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post(config('services.gemini.base_url') . '?key=' . config('services.gemini.api_key'), [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $fullPrompt
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'maxOutputTokens' => 2048,
                    'temperature' => 0.7,
                ],
            ]);

            if (!$response->successful()) {
                throw new \Exception('Gemini API Error: ' . $response->body());
            }

            $generatedText = $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? null;

            if (!$generatedText) {
                throw new \Exception('No content generated');
            }

            $cleanText = preg_replace('/```json\s*|\s*```/', '', $generatedText);

            $parsedData = json_decode($cleanText, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('JSON parsing error:', [
                    'error' => json_last_error_msg(),
                    'original_text' => $generatedText,
                    'cleaned_text' => $cleanText
                ]);
                throw new \Exception('Invalid JSON format in response');
            }

            if (!isset($parsedData['title']) || !isset($parsedData['content'])) {
                Log::error('Missing required fields:', [
                    'parsed_data' => $parsedData
                ]);
                throw new \Exception('Response missing required fields');
            }

            return response()->json([
                'success' => true,
                'title' => $parsedData['title'],
                'content' => str_replace("\n", "<br>", $parsedData['content']) 
            ]);
        }catch(\Exception $e){
            Log::error('Error generating content: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error generating content',
            ], 500);
        }
    }
}
