<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'description',
        'settings',
        'last_message_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'last_message_at' => 'datetime',
    ];

    /**
     * Get the users that belong to the conversation.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_user')
            ->withPivot(['joined_at', 'last_read_at', 'is_admin', 'settings'])
            ->withTimestamps();
    }

    /**
     * Get the messages for the conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get the latest message for the conversation.
     */
    public function latestMessage(): HasMany
    {
        return $this->hasMany(Message::class)->latest();
    }

    /**
     * Scope for direct conversations.
     */
    public function scopeDirect($query)
    {
        return $query->where('type', 'direct');
    }

    /**
     * Scope for group conversations.
     */
    public function scopeGroup($query)
    {
        return $query->where('type', 'group');
    }

    /**
     * Get the other user in a direct conversation.
     */
    public function getOtherUser(User $currentUser)
    {
        if ($this->type !== 'direct') {
            return null;
        }

        return $this->users()
            ->where('users.id', '!=', $currentUser->id)
            ->first();
    }

    /**
     * Get unread message count for a specific user.
     */
    public function getUnreadCountForUser(User $user)
    {
        $lastReadAt = $this->users()
            ->where('users.id', $user->id)
            ->first()
            ?->pivot
            ?->last_read_at;

        $query = $this->messages()->where('user_id', '!=', $user->id);

        if ($lastReadAt) {
            $query->where('created_at', '>', $lastReadAt);
        }

        return $query->count();
    }

    /**
     * Mark conversation as read for a user.
     */
    public function markAsReadForUser(User $user)
    {
        $this->users()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);
    }
}