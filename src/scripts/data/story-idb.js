import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const STORE_NAME_PENDING = 'pending-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME_PENDING)) {
      db.createObjectStore(STORE_NAME_PENDING, { keyPath: 'id', autoIncrement: true });
    }
  },
});

const StoryIdb = {
  async savePendingStory(storyData) {
    return (await dbPromise).put(STORE_NAME_PENDING, storyData);
  },

  async getAllPendingStories() {
    return (await dbPromise).getAll(STORE_NAME_PENDING);
  },

  async deletePendingStory(id) {
    return (await dbPromise).delete(STORE_NAME_PENDING, id);
  },
};

export default StoryIdb;