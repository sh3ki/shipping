<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationUser extends Model
{
    use HasFactory;

    protected $table = 'conversation_user';

    protected $fillable = [
        'conversation_id',
        'user_id',
        'joined_at',
        'last_read_at',
        'is_admin',
        'settings',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'last_read_at' => 'datetime',
        'is_admin' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the conversation.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the user.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}