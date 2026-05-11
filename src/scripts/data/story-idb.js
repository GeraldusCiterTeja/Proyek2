import { openDB } from 'idb';

const dbPromise = openDB('story-db', 1, {
  upgrade(db) {
    db.createObjectStore('stories', { keyPath: 'id' });
    db.createObjectStore('pending-stories', { keyPath: 'tempId', autoIncrement: true });
  },
});

export const StoryIdb = {
  async putStory(story) {
    return (await dbPromise).put('stories', story);
  },
  async getAllStories() {
    return (await dbPromise).getAll('stories');
  },
  // Tambahkan logika delete untuk kriteria Basic
};