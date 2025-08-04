<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the conversations for the user.
     */
    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_user')
            ->withPivot(['joined_at', 'last_read_at', 'is_admin', 'settings'])
            ->withTimestamps()
            ->orderBy('last_message_at', 'desc');
    }

    /**
     * Get the messages sent by the user.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get or create a direct conversation with another user.
     */
    public function getDirectConversationWith(User $otherUser)
    {
        return Conversation::direct()
            ->whereHas('users', function ($query) {
                $query->where('users.id', $this->id);
            })
            ->whereHas('users', function ($query) use ($otherUser) {
                $query->where('users.id', $otherUser->id);
            })
            ->first();
    }

    /**
     * Create a direct conversation with another user.
     */
    public function createDirectConversationWith(User $otherUser)
    {
        $conversation = Conversation::create([
            'type' => 'direct',
        ]);

        $conversation->users()->attach([
            $this->id => ['joined_at' => now()],
            $otherUser->id => ['joined_at' => now()],
        ]);

        return $conversation;
    }
}
