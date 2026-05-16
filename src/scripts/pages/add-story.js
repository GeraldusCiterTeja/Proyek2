import ApiSource from '../data/api';
import L from 'leaflet';

const AddStoryPage = {
  async render() {
    return `
      <section class="add-story-container">
        <h2>Bagikan Cerita Baru</h2>
        <form id="addStoryForm">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" required></textarea>
          </div>
          <div class="form-group">
          <label>Ambil Foto</label>
          <video id="video" width="100%" autoplay playsinline style="display:none; border-radius: 8px;"></video>
          <canvas id="canvas" style="display:none;"></canvas>
            <img 
              id="photoPreview" 
              style="display:none; width:100%; border-radius: 8px;" 
              alt="Pratinjau foto yang akan diunggah"
            >
            <div class="button-group">
              <button type="button" id="btnOpenCamera">Buka Kamera</button>
              <button type="button" id="btnCapture" style="display:none;">Ambil Gambar</button>
            </div>
            <label for="imageInput">Pilih Foto Cerita</label>
            <input type="file" id="imageInput" accept="image/*" required >
            <img id="photoPreview" alt="Pratinjau foto yang akan diunggah" style="display:none;">
          </div>
          <div class="form-group">
            <label>Pilih Lokasi di Peta (Klik pada peta)</label>
            <div id="mapAdd" style="height: 300px; margin-bottom: 10px;"></div>
            <input type="hidden" id="lat" required>
            <input type="hidden" id="lon" required>
            <p id="locationStatus">Lokasi belum dipilih</p>
          </div>
          <button type="submit" id="btnSubmit">Kirim Cerita</button>
        </form>
      </section>
    `;
  },

  async afterRender() {
    const video = document.querySelector('#video');
    const canvas = document.querySelector('#canvas');
    const imageInput = document.querySelector('#imageInput');
    const photoPreview = document.querySelector('#photoPreview');
    let stream = null;

    // 1. Logika Kamera
    document.querySelector('#btnOpenCamera').addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = 'block';
        document.querySelector('#btnCapture').style.display = 'inline-block';
      } catch (err) {
        alert('Gagal akses kamera: ' + err);
      }
    });

    document.querySelector('#btnCapture').addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Matikan stream setelah capture
      stream.getTracks().forEach(track => track.stop());
      video.style.display = 'none';
      
      // Tampilkan preview
      const dataUrl = canvas.toDataURL('image/jpeg');
      photoPreview.src = dataUrl;
      photoPreview.style.display = 'block';

      // Konversi dataURL ke Blob untuk dikirim ke API
      canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        const container = new DataTransfer();
        container.items.add(file);
        imageInput.files = container.files;
      }, 'image/jpeg');
    });

    // 2. Logika Peta 
    const map = L.map('mapAdd').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    let marker = null;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);

      document.querySelector('#lat').value = lat;
      document.querySelector('#lon').value = lng;
      document.querySelector('#locationStatus').innerText = `Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    });

    // 3. Submit Data
    document.querySelector('#addStoryForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('description', document.querySelector('#description').value);
      formData.append('photo', imageInput.files[0]);
      formData.append('lat', document.querySelector('#lat').value);
      formData.append('lon', document.querySelector('#lon').value);

      const response = await ApiSource.postStory(formData);
      if (!response.error) {
        alert('Cerita berhasil dibagikan!');
        window.location.hash = '/home';
      } else {
        alert('Gagal: ' + response.message);
      }
    });
  },
};

export default AddStoryPage;