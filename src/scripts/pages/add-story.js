import ApiSource from '../data/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 1. Import Langsung Gambar Marker (Untuk mengatasi isu gambar pecah di Vite)
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
            
            <div class="button-group">
              <button type="button" id="btnOpenCamera">Buka Kamera</button>
              <button type="button" id="btnCapture" style="display:none;">Ambil Gambar</button>
            </div>
            
            <label for="imageInput">Pilih Foto Cerita</label>
            <input type="file" id="imageInput" accept="image/*" required >
            <img id="photoPreview" alt="Pratinjau foto yang akan diunggah" style="display:none; width:100%; border-radius: 8px; margin-top: 10px;">
          </div>
          <div class="form-group">
            <label>Pilih Lokasi di Peta (Opsional)</label>
            <div id="mapAdd" style="height: 300px; margin-bottom: 10px;"></div>
            
            <input type="hidden" id="lat">
            <input type="hidden" id="lon">
            
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

    // --- Logika Kamera ---
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
      
      stream.getTracks().forEach(track => track.stop());
      video.style.display = 'none';
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      photoPreview.src = dataUrl;
      photoPreview.style.display = 'block';

      canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        const container = new DataTransfer();
        container.items.add(file);
        imageInput.files = container.files;
      }, 'image/jpeg');
    });

    imageInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          photoPreview.src = e.target.result;
          photoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    // --- Logika Peta ---
    const map = L.map('mapAdd').setView([-2.5, 118], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    let currentMarker;

    map.on('click', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (currentMarker) {
        map.removeLayer(currentMarker);
      }
    
      currentMarker = L.marker([lat, lng], { icon: defaultIcon }).addTo(map);

      // Memastikan nilai dimasukkan ke ID yang tepat dan teks di-update
      document.querySelector('#lat').value = lat;
      document.querySelector('#lon').value = lng;
      document.querySelector('#locationStatus').innerText = `Koordinat: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    });

    // --- Submit Data ---
    document.querySelector('#addStoryForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('description', document.querySelector('#description').value);
      formData.append('photo', imageInput.files[0]);

      // Ambil nilai koordinat
      const latValue = document.querySelector('#lat').value;
      const lonValue = document.querySelector('#lon').value;

      // SOLUSI: Hanya kirim ke API jika user benar-benar telah memilih lokasi
      // Serta kita parsing menjadi angka (Float) agar diterima oleh Joi Validation API
      if (latValue && lonValue) {
        formData.append('lat', parseFloat(latValue));
        formData.append('lon', parseFloat(lonValue));
      }

      try {
        const response = await ApiSource.postStory(formData);
        if (!response.error) {
          alert('Cerita berhasil dibagikan!');
          // Redirect ke halaman home (notifikasi akan dikirim oleh server otomatis)
          window.location.hash = '/home';
        } else {
          alert(`Gagal: ${response.message}`);
        }
      } catch (error) {
        console.error('Error saat submit:', error);
      }
    });
  },
};

export default AddStoryPage;