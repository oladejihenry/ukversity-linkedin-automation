<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LinkedInController extends Controller
{
    public function redirect()
    {
        $state = Str::random(40);
        session(['linkedin_oauth_state' => $state]);

        $queryParams = http_build_query([
            'response_type' => 'code',
            'client_id' => config('services.linkedin.client_id'),
            'redirect_uri' => config('services.linkedin.redirect'),
            'state' => $state,
            'scope' => 'openid profile w_member_social email',
            'access_type' => 'offline'
        ]);

        $authUrl = "https://www.linkedin.com/oauth/v2/authorization?{$queryParams}";
        
        return response()->json(['auth_url' => $authUrl]);
    }

    public function callback(Request $request)
    {
        try {
            if (!$request->has('code')) {
                throw new \Exception('Authorization code not received');
            }

            Log::info('LinkedIn Callback Data', [
                'code' => $request->code,
                'state' => $request->state,
                'error' => $request->error ?? null
            ]);

            $code = $request->query('code');

            Log::info('LinkedIn Callback Code', [
                'code' => $code,
            ]);

            // Exchange code for token exactly as per LinkedIn docs
            $response = Http::asForm()->post('https://www.linkedin.com/oauth/v2/accessToken', [
                'grant_type'    => 'authorization_code',
                'code'          => $code,
                'client_id'     => config('services.linkedin.client_id'),
                'client_secret' => config('services.linkedin.client_secret'),
                'redirect_uri'  => config('services.linkedin.redirect'),
            ]);

            Log::info('response', [
                'response' => $response->json(),
            ]);

            // // Log the response for debugging
            Log::info('LinkedIn Token Response', [
                'status' => $response->status(),
                'body' => $response->json(),
                'headers' => $response->headers()
            ]);

            if (!$response->successful()) {
                Log::error('LinkedIn token error', [
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to get access token',
                    'details' => $response->json()
                ], 500);
            }

            $tokenData = $response->json();

            // // Get user profile
            $profileResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $tokenData['access_token'],
            ])->get('https://api.linkedin.com/v2/userinfo');

            if (!$profileResponse->successful()) {
                Log::error('LinkedIn profile error', [
                    'status' => $profileResponse->status(),
                    'response' => $profileResponse->json()
                ]);
                throw new \Exception('Failed to get LinkedIn profile');
            }

            $profileData = $profileResponse->json();

            // // Get email address
            $emailResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $tokenData['access_token'],
                // 'X-Restli-Protocol-Version' => '2.0.0'
            ])->get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))');

            // $userData = [
            //     'access_token' => $tokenData['access_token'],
            //     'expires_in' => $tokenData['expires_in'],
            //     'profile' => $profileData,
            //     'email' => $emailResponse->json()
            // ];

            // // Store in user's session or database as needed
            $user = User::where('email', $profileData['email'])->first();
            if ($user) {
                $user->update([
                    'linkedin_access_token' => $tokenData['access_token'],
                    'linkedin_refresh_token' => $tokenData['refresh_token'] ?? null, 
                    'linkedin_token_expires_at' => now()->addSeconds($tokenData['expires_in']),
                    'linkedin_person_id' => $profileData['sub']
                ]);
            }

            return redirect()->intended(config('app.frontend_url') . '/dashboard');

        } catch (\Exception $e) {
            Log::error('LinkedIn callback error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function disconnect(Request $request)
    {
        try {
            $user = $request->user();
            $user->update([
                'linkedin_access_token' => null,
                'linkedin_token_expires_at' => null,
                'linkedin_refresh_token' => null,
                'linkedin_person_id' => null
            ]);
            return response()->json([
                'success' => true,
                'message' => 'LinkedIn disconnected successfully'
            ]);
        } catch (\Exception $th) {
            Log::error('LinkedIn disconnect error', [
                'message' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'error' => $th->getMessage()
            ], 500);
        }
        
    }

    public function status(Request $request)
    {
        try {
            $user = $request->user();
            $isExpired = !$user->linkedin_token_expires_at || 
                     $user->linkedin_token_expires_at->isPast();

            return response()->json([
                'success' => true,
                'isConnected' => !empty($user->linkedin_access_token),
                'isExpired' => $isExpired,
                'expiresAt' => $user->linkedin_token_expires_at,
            ]);
            
        } catch (\Exception $e) {
            Log::error('LinkedIn status check error', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to check LinkedIn status'
            ], 500);
        }
        
    }
}