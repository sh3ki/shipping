<?php

namespace App\Events;

use App\Models\Cell_Info;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CellsInformationUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $cellInfo;

    public function __construct(Cell_Info $cellInfo)
    {
        $this->cellInfo = $cellInfo;
    }

    public function broadcastOn()
    {
        return new Channel('cells-information');
    }

    public function broadcastAs()
    {
        return 'CellsInformationUpdated';
    }
}
