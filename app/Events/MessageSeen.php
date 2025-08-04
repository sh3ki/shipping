<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSeen implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversation;
    public $user;
    public $lastReadAt;

    /**
     * Create a new event instance.
     */
    public function __construct(Conversation $conversation, User $user, $lastReadAt)
    {
        $this->conversation = $conversation;
        $this->user = $user;
        $this->lastReadAt = $lastReadAt;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return new Channel('conversation.' . $this->conversation->id);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'MessageSeen';
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'conversation_id' => $this->conversation->id,
            'user_id' => $this->user->id,
            'last_read_at' => $this->lastReadAt->toISOString(),
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ],
        ];
    }
}