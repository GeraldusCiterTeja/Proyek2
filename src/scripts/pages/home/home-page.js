import ApiSource from '../../data/api'; // Naik 3 tingkat ke folder data
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FavoriteStoryIdb from '../../data/favorite-story-idb'; // Naik 3 tingkat ke folder data

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

const HomePage = {
  async render() {
    return `
      <section class="home-container">
        <h2>Daftar Cerita Terkini</h2>
        <div id="map" style="height: 400px; width: 100%; margin-bottom: 20px;" aria-label="Peta lokasi cerita"></div>
        <div id="storyList" class="story-list">
          <p>Memuat cerita...</p>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const storyContainer = document.querySelector('#storyList');
    const response = await ApiSource.getAllStoriesWithLocation();

    if (response.error || !response.listStory) {
      storyContainer.innerHTML = `<p class="error-message">Gagal memuat data: ${response.message}</p>`;
      return;
    }
    const stories = response.listStory;
    storyContainer.innerHTML = '';

    // Inisialisasi Peta
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    });

    const map = L.map('map', {
      center: [-2.5, 118], 
      zoom: 5,
      layers: [osmLayer] 
    });

    const baseMaps = {
      "Street View": osmLayer,
      "Satellite View": satelliteLayer
    };
    L.control.layers(baseMaps).addTo(map);

    // Render Data & Marker secara Asinkronus menggunakan for...of
    for (const story of stories) {
      const isFavorite = await FavoriteStoryIdb.getStory(story.id);

      const marker = L.marker([story.lat, story.lon], { icon: defaultIcon }).addTo(map);
      marker.bindPopup(`
        <div class="map-popup">
          <img src="${story.photoUrl}" alt="Foto dari ${story.name}" style="width:100px">
          <h3><strong>${story.name}</strong></h3>
          <p>${formatDate(story.createdAt)}</p>
          <p class="description">${story.description}</p>
        </div>
      `);

      const storyItem = document.createElement('div');
      storyItem.className = 'story-item';
      storyItem.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" crossorigin="anonymous">
        <div class="content">
          <h3>${story.name}</h3>
          <p class="date">${formatDate(story.createdAt)}</p>
          <p class="description">${story.description}</p>
          
          <button class="btn-favorite" data-id="${story.id}">
            ${isFavorite ? '⭐ Hapus Terfavorit' : '🔖 Simpan Terfavorit'}
          </button>
        </div>
      `;
      
      // Logika tombol klik favorit (IndexedDB)
      const btnFav = storyItem.querySelector('.btn-favorite');
      btnFav.addEventListener('click', async (event) => {
        event.stopPropagation(); // Mencegah peta ikut bergeser saat tombol ditekan
        
        const isCurrentlyFavorite = await FavoriteStoryIdb.getStory(story.id);

        if (isCurrentlyFavorite) {
          await FavoriteStoryIdb.deleteStory(story.id);
          btnFav.innerText = '🔖 Simpan Terfavorit';
          alert('Cerita dihapus dari daftar favorit.');
        } else {
          await FavoriteStoryIdb.putStory(story);
          btnFav.innerText = '⭐ Hapus Terfavorit';
          alert('Cerita berhasil disimpan ke favorit!');
        }
      });

      // Klik item kartu untuk mengarahkan kamera peta
      storyItem.addEventListener('click', () => {
        map.flyTo([story.lat, story.lon], 13);
        marker.openPopup();
      });

      storyContainer.appendChild(storyItem);
    }
  },
};

export default HomePage;