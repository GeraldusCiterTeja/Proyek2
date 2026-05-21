import ApiSource from './scripts/data/api';
import StoryIdb from './scripts/data/story-idb';

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-story') {
    event.waitUntil(syncStoriesToServer());
  }
});

async function syncStoriesToServer() {
  const pendingStories = await StoryIdb.getAllPendingStories();

  for (const story of pendingStories) {
    try {
      const formData = new FormData();
      formData.append('description', story.description);
      formData.append('photo', story.photo);
      if (story.lat) formData.append('lat', story.lat);
      if (story.lon) formData.append('lon', story.lon);

      const response = await ApiSource.addStory(formData);

      if (!response.error) {
        await StoryIdb.deletePendingStory(story.id);
      }
    } catch (error) {
      console.error('Gagal sinkronisasi otomatis:', error);
    }
  }
}

// --- EVENT LISTENER UNTUK MENERIMA PUSH NOTIFICATION ---
self.addEventListener('push', (event) => {
  let data;
  try {
    // Mencoba membaca data JSON yang dikirim oleh server Dicoding
    data = event.data ? event.data.json() : { title: 'Story App', message: 'Ada pembaruan komponen!' };
  } catch (err) {
    // Jika server mengirim text biasa, bukan JSON
    data = { title: 'Story App', message: event.data ? event.data.text() : 'Ada cerita baru untukmu!' };
  }

  const options = {
    body: data.message || data.body || 'Cek aplikasi sekarang.',
    icon: '/icons/icon-192x192.png', // Sesuaikan nama file ikon utama Anda
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Menangani aksi ketika spanduk notifikasi diklik oleh user
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Jika aplikasi sudah terbuka, fokuskan ke tab tersebut
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika belum terbuka, buka tab baru menuju beranda aplikasi
      if (clients.openWindow) {
        return clients.openWindow('./#/home');
      }
    })
  );
});