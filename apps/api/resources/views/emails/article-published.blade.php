@extends('emails.layouts.app')

@section('title', 'Article Published on LinkedIn')

@section('header')
<div class="header">
    <h1>🚀 Article Published on LinkedIn!</h1>
</div>
@endsection

@section('content')
<div class="content">
    <h2>Hello {{ $user->name }},</h2>
    
    <p>Congratulations! Your article <strong>"{{ $article->title }}"</strong> has been successfully published on LinkedIn.</p>
    
    <div class="stats">
        <h3>📊 Publication Details:</h3>
        <ul>
            <li><strong>Title:</strong> {{ $article->title }}</li>
            <li><strong>Published:</strong> {{ $article->published_at->format('M d, Y \a\t g:i A') }}</li>
            <li><strong>LinkedIn Post ID:</strong> {{ $article->linkedin_post_id }}</li>
            @if($article->video_status === 'completed')
                <li><strong>Video:</strong> ✅ Included</li>
            @endif
        </ul>
    </div>
    
    <div style="text-align: center;">
        <a href="https://www.linkedin.com/feed/update/{{ $article->linkedin_post_id }}" class="button">
            View on LinkedIn
        </a>
    </div>
    
    <p>Your content is now live and reaching your professional network. Keep an eye on your LinkedIn analytics to see how it performs!</p>
</div>
@endsection

@section('footer')
<div class="footer">
    <p>Best regards,<br>The {{ config('app.name') }} Team</p>
    <p>© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
</div>
@endsection