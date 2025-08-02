<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CategoryUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $category;
    public $cells;

    /**
     * Create a new event instance.
     *
     * @param mixed $category
     * @param \Illuminate\Support\Collection $cells
     */
    public function __construct($category, $cells)
    {
        $this->category = $category;
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
            'category' => $this->category,
            'cells' => $this->cells,
        ];
    }

    public function broadcastAs()
    {
        return 'CategoryUpdated';
    }
}
