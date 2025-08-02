<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CategoryCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $category;
    public $cells;

    /**
     * Create a new event instance.
     */
    public function __construct($category, $cells = null)
    {
        $this->category = $category;
        $this->cells = $cells;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return new Channel('categories');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'CategoryCreated';
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'category' => $this->category,
            'cells' => $this->cells,
        ];
    }
}
