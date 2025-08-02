import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: 'bI8Dj5xkFw4B7NqH74tX9tkc3pO5H2X6',
    cluster: 'mt1',
    wsHost: '127.0.0.1',
    wsPort: 6001,
    forceTLS: false,
    encrypted: false,
    disableStats: true,
    enabledTransports: ['ws'],
});

export default echo;
