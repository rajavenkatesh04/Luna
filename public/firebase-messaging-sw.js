// Import the Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// IMPORTANT: This part is new. It gets your config from the browser's URL.
// This makes sure the correct keys are used for your deployed app.
const urlParams = new URLSearchParams(location.search);
const firebaseConfig = JSON.parse(urlParams.get("firebaseConfig"));

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

// This handler runs when a notification is clicked
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});
