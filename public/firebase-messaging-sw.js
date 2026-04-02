importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDwb3gkdW1tzZL8dNWaio9WvXQReHfYoHQ",
  projectId: "habit-tracker-91542",
  messagingSenderId: "363455937593",
  appId: "1:363455937593:web:4ba0e4b1334c553388a1e8",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("SW RECEIVED:", payload);

  const { title, body } = payload.data;

  self.registration.showNotification(title, {
    body,
    icon: "/icon.png",
    badge: "/badge.png",
    image: "/habit-banner.png",
    vibrate: [200, 100, 200],
    tag: "habit-reminder",
    renotify: true,
    actions: [
      { action: "done", title: "✅ Done" },
      { action: "skip", title: "⏭ Skip" },
    ],
  });
});