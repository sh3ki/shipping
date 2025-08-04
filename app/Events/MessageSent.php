<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message->load(['user', 'conversation']);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return new Channel('conversation.' . $this->message->conversation_id);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'MessageSent';
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'user_id' => $this->message->user_id,
                'content' => $this->message->content,
                'type' => $this->message->type,
                'metadata' => $this->message->metadata,
                'created_at' => $this->message->created_at->toISOString(),
                'updated_at' => $this->message->updated_at->toISOString(),
                'user' => [
                    'id' => $this->message->user->id,
                    'name' => $this->message->user->name,
                    'email' => $this->message->user->email,
                ],
            ],
        ];
    }
}