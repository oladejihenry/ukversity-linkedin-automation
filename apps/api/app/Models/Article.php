<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'status',
        'scheduled_for',
        'scheduled_at',
        'user_id',
        'linkedin_post_id',
        'linkedin_posted_at',
        'linkedin_error_message',
        'publishing_lock_until',
    ];

    protected $casts = [
        'scheduled_for' => 'datetime',
        'scheduled_at' => 'datetime',
        'linkedin_posted_at' => 'datetime',
        'publishing_lock_until' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isReadyToPublish(): bool
    {
        return $this->status === 'scheduled' && 
               $this->scheduled_for && 
               $this->scheduled_for->isPast() &&
               !$this->linkedin_post_id;
    }

    public function isPublished(): bool
    {
        return !empty($this->linkedin_post_id);
    }

    public function hasPublishingLock(): bool
    {
        return $this->publishing_lock_until && $this->publishing_lock_until->isFuture();
    }
}
