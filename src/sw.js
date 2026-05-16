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