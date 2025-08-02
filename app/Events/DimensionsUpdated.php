<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DimensionsUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $map_length;
    public $map_width;

    /**
     * Create a new event instance.
     */
    public function __construct($map_length, $map_width)
    {
        $this->map_length = $map_length;
        $this->map_width = $map_width;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        return new Channel('map-layout');
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'DimensionsUpdated';
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith()
    {
        $data = [
            'map_length' => $this->map_length,
            'map_width' => $this->map_width,
        ];
        
        return $data;
    }
}
