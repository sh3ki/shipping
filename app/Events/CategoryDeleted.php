<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CategoryDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $categoryId;
    public $cells;

    /**
     * Create a new event instance.
     *
     * @param int $categoryId
     * @param \Illuminate\Support\Collection $cells
     */
    public function __construct($categoryId, $cells)
    {
        $this->categoryId = $categoryId;
        $this->cells = $cells;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('map-layout');
    }

    public function broadcastWith()
    {
        return [
            'categoryId' => $this->categoryId,
            'cells' => $this->cells,
        ];
    }

    public function broadcastAs()
    {
        return 'CategoryDeleted';
    }
}
