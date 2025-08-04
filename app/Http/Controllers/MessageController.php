<?php

namespace App\Http\Controllers;

use App\Events\MessageSeen;
use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display a listing of conversations.
     */
    public function index()
    {
        $user = Auth::user();
        
        $conversations = $user->conversations()
            ->with([
                'users:id,name,email',
                'latestMessage' => function ($query) {
                    $query->with('user:id,name')->latest()->take(1);
                }
            ])
            ->get()
            ->map(function ($conversation) use ($user) {
                $conversation->unread_count = $conversation->getUnreadCountForUser($user);
                
                if ($conversation->type === 'direct') {
                    $otherUser = $conversation->getOtherUser($user);
                    $conversation->display_name = $otherUser ? $otherUser->name : 'Unknown User';
                    $conversation->other_user = $otherUser;
                } else {
                    $conversation->display_name = $conversation->name ?: 'Group Chat';
                }
                
                return $conversation;
            });

        return $conversations;
    }

    /**
     * Display the specified conversation.
     */
    public function show(Conversation $conversation)
    {
        $user = Auth::user();

        // Check if user is part of the conversation
        if (!$conversation->users()->where('users.id', $user->id)->exists()) {
            abort(403, 'You are not authorized to view this conversation.');
        }


        $messages = $conversation->messages()
            ->with(['user:id,name,email'])
            ->get()
            ->map(function ($message) use ($conversation) {
                // Prefix columns to avoid ambiguity
                $seenByUsers = $message->seenByUsers()->get(['users.id as user_id', 'users.name']);
                $message->seen_by = $seenByUsers;
                return $message;
            });

        $participants = $conversation->users()->get(['users.id as user_id', 'users.name', 'users.email']);

        // Mark conversation as read
        $conversation->markAsReadForUser($user);

        return response()->json([
            'conversation' => $conversation->load('users:id,name,email'),
            'messages' => $messages,
            'participants' => $participants,
        ]);
    }

    /**
     * Store a newly created message.
     */
    public function store(Request $request, Conversation $conversation)
    {
        $user = Auth::user();

        // Check if user is part of the conversation
        if (!$conversation->users()->where('users.id', $user->id)->exists()) {
            abort(403, 'You are not authorized to send messages to this conversation.');
        }

        $validated = $request->validate([
            'content' => 'required|string|max:10000',
            'type' => 'in:text,image,file',
            'metadata' => 'nullable|array',
        ]);

        $message = $conversation->messages()->create([
            'user_id' => $user->id,
            'content' => $validated['content'],
            'type' => $validated['type'] ?? 'text',
            'metadata' => $validated['metadata'] ?? null,
        ]);

        // Update conversation's last_message_at
        $conversation->update(['last_message_at' => now()]);

        // Load the message with user relationship
        $message->load('user:id,name,email');

        // Broadcast the message
        event(new MessageSent($message));

        return response()->json(['message' => $message], 201);
    }

    /**
     * Mark messages as seen.
     */
    public function markAsSeen(Request $request, Conversation $conversation)
    {
        $user = Auth::user();

        // Check if user is part of the conversation
        if (!$conversation->users()->where('users.id', $user->id)->exists()) {
            abort(403, 'You are not authorized to mark messages as seen in this conversation.');
        }

        $lastReadAt = now();
        $conversation->markAsReadForUser($user);

        // Broadcast the seen event
        event(new MessageSeen($conversation, $user, $lastReadAt));

        return response()->json(['success' => true]);
    }

    /**
     * Create or get a direct conversation with another user.
     */
    public function createDirectConversation(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|different:' . Auth::id(),
        ]);

        $currentUser = Auth::user();
        $otherUser = User::findOrFail($request->user_id);

        // Check if conversation already exists
        $conversation = $currentUser->getDirectConversationWith($otherUser);

        if (!$conversation) {
            $conversation = $currentUser->createDirectConversationWith($otherUser);
        }

        return response()->json(['conversation' => $conversation->load('users:id,name,email')]);
    }

    /**
     * Create a group conversation.
     */
    public function createGroupConversation(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id|different:' . Auth::id(),
        ]);

        $conversation = Conversation::create([
            'type' => 'group',
            'name' => $request->name,
            'description' => $request->description,
        ]);

        // Add the creator as admin
        $userIds = collect($request->user_ids)->push(Auth::id())->unique();
        
        $attachData = [];
        foreach ($userIds as $userId) {
            $attachData[$userId] = [
                'joined_at' => now(),
                'is_admin' => $userId == Auth::id(), // Creator is admin
            ];
        }

        $conversation->users()->attach($attachData);

        return response()->json(['conversation' => $conversation->load('users:id,name,email')]);
    }

    /**
     * Get all users for creating conversations.
     */
    public function getUsers()
    {
        $currentUser = Auth::user();
        
        $users = User::where('id', '!=', $currentUser->id)
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return response()->json(['users' => $users]);
    }
}
