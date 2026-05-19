import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-favorite-db';
const DATABASE_VERSION = 1;
const STORE_NAME = 'favorite-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

const FavoriteStoryIdb = {
  async getStory(id) {
    if (!id) return;
    return (await dbPromise).get(STORE_NAME, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(STORE_NAME);
  },

  async putStory(story) {
    if (!story.hasOwnProperty('id')) return;
    return (await dbPromise).put(STORE_NAME, story);
  },

  async deleteStory(id) {
    if (!id) return;
    return (await dbPromise).delete(STORE_NAME, id);
  },
};

export default FavoriteStoryIdb;