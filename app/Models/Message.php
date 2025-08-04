<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'content',
        'type',
        'metadata',
        'edited_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'edited_at' => 'datetime',
    ];

    /**
     * Get the conversation that owns the message.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the user that owns the message.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the message has been seen by a specific user.
     */
    public function hasBeenSeenBy(User $user): bool
    {
        $lastReadAt = $this->conversation
            ->users()
            ->where('users.id', $user->id)
            ->first()
            ?->pivot
            ?->last_read_at;

        return $lastReadAt && $this->created_at <= $lastReadAt;
    }

    /**
     * Get users who have seen this message.
     */
    public function seenByUsers()
    {
        // Prefix columns to avoid ambiguity
        return $this->conversation->users()
            ->select('users.id as user_id', 'users.name')
            ->wherePivot('last_read_at', '>=', $this->created_at)
            ->where('users.id', '!=', $this->user_id);
    }
}