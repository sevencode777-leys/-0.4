
const CACHE_NAME = 'rafeeq-v4';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Static assets for offline functionality
const OFFLINE_FALLBACKS = {
    '/': '/index.html',
    '/quran': '/index.html',
    '/hadith': '/index.html',
    '/prayer': '/index.html'
};

// Install event
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Activate event
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline actions
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
    
    if (event.tag === 'prayer-times-sync') {
        event.waitUntil(syncPrayerTimes());
    }
});

// Push notification handling
self.addEventListener('push', function(event) {
    if (event.data) {
        const notificationData = event.data.json();
        
        const options = {
            body: notificationData.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [200, 100, 200],
            data: notificationData.data,
            actions: [
                {
                    action: 'open-app',
                    title: 'فتح التطبيق',
                    icon: '/icons/icon-72x72.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(notificationData.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'open-app') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Enhanced offline sync
async function doBackgroundSync() {
    try {
        // Sync any pending data when connection is restored
        const pendingData = await getStoredPendingData();
        
        if (pendingData.length > 0) {
            await syncDataToServer(pendingData);
            await clearPendingData();
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

async function syncPrayerTimes() {
    try {
        // Update prayer times when connection is available
        const position = await getCurrentPosition();
        const prayerTimes = await fetch(`https://api.aladhan.com/v1/timings?latitude=${position.lat}&longitude=${position.lng}&method=4`);
        
        if (prayerTimes.ok) {
            const data = await prayerTimes.json();
            await storePrayerTimes(data.data.timings);
        }
    } catch (error) {
        console.log('Prayer times sync failed:', error);
    }
}

// Helper functions for data management
async function getStoredPendingData() {
    // Implementation for retrieving pending sync data
    return [];
}

async function syncDataToServer(data) {
    // Implementation for syncing data to server
}

async function clearPendingData() {
    // Implementation for clearing synced data
}

async function getCurrentPosition() {
    // Implementation for getting user position
    return { lat: 0, lng: 0 };
}

async function storePrayerTimes(timings) {
    // Implementation for storing prayer times
}

function doBackgroundSync() {
    // Sync data when online
    return Promise.resolve();
}

// Push notifications
self.addEventListener('push', function(event) {
    const options = {
        body: event.data ? event.data.text() : 'رسالة من رفيق',
        icon: 'icons/icon-192x192.png',
        badge: 'icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore', 
                title: 'فتح التطبيق',
                icon: 'icons/icon-72x72.png'
            },
            {
                action: 'close', 
                title: 'إغلاق'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('رفيق - التذكير', options)
    );
});

// Notification click
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
