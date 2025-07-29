// public/firebase-messaging-sw.js

// These scripts are required to use the Firebase SDK in a service worker.
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

// Your project's Firebase configuration.
const firebaseConfig = {
    apiKey: "AIzaSyByUI63RS43luFj4muI6wJ63Oi_r-oiUB0",
    authDomain: "luna-7e694.firebaseapp.com",
    projectId: "luna-7e694",
    storageBucket: "luna-7e694.appspot.com",
    messagingSenderId: "229790199796",
    appId: "1:229790199796:web:00b4907b32d2f25c5093a1",
};


// Initialize the Firebase app in the service worker.
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        "[firebase-messaging-sw.js] Received background message: ",
        payload
    );

    // Customize the notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png', // Make sure you have an icon in your public folder
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});