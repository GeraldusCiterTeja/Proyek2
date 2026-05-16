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
    btnSubscribe.addEventListener('click', async () => {
      try {
        await PushHelper.subscribe();
        alert('Notifikasi berhasil diaktifkan!');
        btnSubscribe.disabled = true;
        btnSubscribe.innerText = '🔔 Notifikasi Aktif';
      } catch (err) {
        console.error('Gagal langganan push:', err);
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