<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Channel for conversation messages
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    
    if (!$conversation) {
        return false;
    }

    // Check if the user is part of this conversation
    return $conversation->users()->where('users.id', $user->id)->exists();
});

// Channel for general messages (for notifications, etc.)
Broadcast::channel('messages', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});