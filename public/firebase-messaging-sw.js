// Import the Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Get your config from the browser's URL.
const urlParams = new URLSearchParams(location.search);
const firebaseConfig = JSON.parse(urlParams.get("firebaseConfig"));

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// This handler runs when a notification is received in the background.
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Handle both data-only messages and notification messages for maximum compatibility
    let notificationTitle, notificationBody, notificationUrl;

    if (payload.notification) {
        // If the server sent a notification object (future-proofing your code)
        notificationTitle = payload.notification.title;
        notificationBody = payload.notification.body;
    } else if (payload.data) {
        // If the server sent only data (your current approach)
        notificationTitle = payload.data.title;
        notificationBody = payload.data.body;
    }

    // The URL should always be in the data field
    notificationUrl = payload.data?.url || payload.data?.click_action;

    // Fallback values in case something is missing - this prevents broken notifications
    notificationTitle = notificationTitle || 'Event Update';
    notificationBody = notificationBody || 'You have a new announcement';

    const notificationOptions = {
        body: notificationBody,
        tag: 'event-notification', // This prevents duplicate notifications from stacking up
        data: {
            url: notificationUrl // This passes the URL to the click handler
        },
        // Keep the notification visible until user interacts with it
        requireInteraction: true,
        // Allow normal notification sounds and vibration
        silent: false
    };

    // Show the notification to the user
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// This handler runs when a notification is clicked
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification);

    // Close the notification when clicked
    event.notification.close();

    // Open the URL if one was provided in the notification data
    if (event.notification.data && event.notification.data.url) {
        // This opens the URL that was passed in the data payload
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});