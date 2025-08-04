<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CellsInformationDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $cell_id;

    public function __construct($cell_id)
    {
        $this->cell_id = $cell_id;
    }

    public function broadcastOn()
    {
        return new Channel('cells-information');
    }

    public function broadcastAs()
    {
        return 'CellsInformationDeleted';
    }

    public function broadcastWith()
    {
        return [
            'cell_id' => $this->cell_id,
        ];
    }
}
