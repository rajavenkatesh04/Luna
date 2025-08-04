importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyCJ0DHebGc9fd5WLD6DF_tp8se7CGQRbiQ",
    authDomain: "luna-895ae.firebaseapp.com",
    projectId: "luna-895ae",
    storageBucket: "luna-895ae.firebasestorage.app",
    messagingSenderId: "430728041821",
    appId: "1:430728041821:web:78446a6c84672f8c5404b4",
    measurementId: "G-P0G1P8J529"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// You can still keep this file to retrieve the messaging instance,
// but you don't need the onBackgroundMessage handler if you're only
// using the 'notification' payload. The SDK handles it.
const messaging = firebase.messaging();

self.addEventListener('notificationclick', (event) => {
    // Close the notification
    event.notification.close();

    // Get the URL from the data payload and open it
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});