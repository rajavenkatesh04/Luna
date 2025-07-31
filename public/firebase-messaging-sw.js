importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyByUI63RS43luFj4muI6wJ63Oi_r-oiUB0",
    authDomain: "luna-7e694.firebaseapp.com",
    projectId: "luna-7e694",
    storageBucket: "luna-7e694.appspot.com",
    messagingSenderId: "229790199796",
    appId: "1:229790199796:web:00b4907b32d2f25c5093a1",
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