import '../styles/styles.css';
import App from './pages/app';
import NavInitiator from './utils/nav-initiator';
import PushHelper from './utils/push-helper';
import { registerSW } from 'virtual:pwa-register';

const app = new App({
  content: document.querySelector('#mainContent'),
});

const renderApp = async () => {
  await app.renderPage();
  
  NavInitiator.init({
    navLinksContainer: document.querySelector('#navLinks'),
  });

  const btnSubscribe = document.querySelector('#subscribePush');
  if (btnSubscribe) {
    const registration = await navigator.serviceWorker.ready;
    const currentSubscription = await registration.pushManager.getSubscription();
    
    // Set status teks awal tombol berdasarkan status langganan aktif
    let isSubscribed = currentSubscription !== null;
    btnSubscribe.innerText = isSubscribed ? '🔕 Matikan Notifikasi' : '🔔 Aktifkan Notifikasi';

    btnSubscribe.addEventListener('click', async () => {
      btnSubscribe.disabled = true; // Mencegah klik ganda saat proses jaringan
      try {
        if (isSubscribed) {
          // Jika sudah sub, jalankan fungsi Unsubscribe (DELETE)
          await PushHelper.unsubscribe();
          alert('Notifikasi berhasil dimatikan.');
          btnSubscribe.innerText = '🔔 Aktifkan Notifikasi';
          isSubscribed = false;
        } else {
          // Jika belum sub, jalankan fungsi Subscribe (POST)
          await PushHelper.subscribe();
          alert('Notifikasi berhasil diaktifkan!');
          btnSubscribe.innerText = '🔕 Matikan Notifikasi';
          isSubscribed = true;
        }
      } catch (err) {
        console.error('Gagal mengubah status push notification:', err);
        alert('Terjadi kesalahan, coba lagi nanti.');
      } finally {
        btnSubscribe.disabled = false;
      }
    });
  }
};

registerSW({
  onNeedRefresh() {
    if (confirm('Ada konten baru, muat ulang aplikasi?')) {
      location.reload();
    }
  },
  onOfflineReady() {
    console.log('Aplikasi siap diakses secara offline');
  },
});

window.addEventListener('hashchange', renderApp);
window.addEventListener('load', renderApp);