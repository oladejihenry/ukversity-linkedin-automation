@extends('emails.layouts.app')

@section('title', 'Video Generation Completed')


@section('header')
    <div class="header">
        <h1>🎥 Video Generation Completed!</h1>
    </div>
@endsection

@section('content')
    
    <div class="content">
        <h2>Hello {{ $user->name }},</h2>
        
        <p>Great news! The video for your article <strong>"{{ $article->title }}"</strong> has been generated successfully.</p>
        
        <p>Your article will not be published on LinkedIn with the video attached.</p>
        
        <p>Watch out for an another email about the scheduled LinkedIn post.</p>
        
        <p><strong>Article Details:</strong></p>
        <ul>
            <li><strong>Title:</strong> {{ $article->title }}</li>
            <li><strong>Status:</strong> {{ ucfirst($article->status) }}</li>
            <li><strong>Created:</strong> {{ $article->created_at->format('M d, Y') }}</li>
        </ul>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
@endsection

@section('footer')
    <div class="footer">
        <p>Best regards,<br>The {{ config('app.name') }} Team</p>
        <p>© {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
    </div>
@endsection