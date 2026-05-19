import FavoriteStoryIdb from '../data/favorite-story-idb';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const FavoritePage = {
  async render() {
    return `
      <section class="favorite-container">
        <h2>Cerita Favorit Anda</h2>
        <div id="favoriteStoryList" class="story-list">
          <p>Memuat cerita favorit...</p>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const storyContainer = document.querySelector('#favoriteStoryList');
    
    // Mengambil semua data cerita yang tersimpan di IndexedDB
    const stories = await FavoriteStoryIdb.getAllStories();
    
    storyContainer.innerHTML = '';

    // Jika belum ada cerita yang disimpan
    if (stories.length === 0) {
      storyContainer.innerHTML = `
        <p class="empty-message" style="text-align: center; grid-column: 1/-1; color: #666;">
          Belum ada cerita yang Anda simpan ke favorit.
        </p>
      `;
      return;
    }

    // Merender daftar cerita favorit
    stories.forEach((story) => {
      const storyItem = document.createElement('div');
      storyItem.className = 'story-item';
      storyItem.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" crossorigin="anonymous">
        <div class="content">
          <h3>${story.name}</h3>
          <p class="date">${formatDate(story.createdAt)}</p>
          <p class="description">${story.description}</p>
          
          <button class="btn-delete-fav" data-id="${story.id}" style="background-color: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
            ❌ Hapus dari Favorit
          </button>
        </div>
      `;

      // Event listener untuk menghapus cerita langsung dari halaman favorit
      const btnDelete = storyItem.querySelector('.btn-delete-fav');
      btnDelete.addEventListener('click', async (event) => {
        event.stopPropagation();
        
        if (confirm('Apakah Anda yakin ingin menghapus cerita ini dari favorit?')) {
          await FavoriteStoryIdb.deleteStory(story.id);
          alert('Cerita berhasil dihapus.');
          
          // Render ulang komponen halaman setelah data dihapus
          this.afterRender();
        }
      });

      storyContainer.appendChild(storyItem);
    });
  },
};

export default FavoritePage;