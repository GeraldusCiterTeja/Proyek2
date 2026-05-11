import '../styles/styles.css';
import App from './pages/app';
import NavInitiator from './utils/nav-initiator';
import { registerSW } from 'virtual:pwa-register';

const app = new App({
  content: document.querySelector('#mainContent'),
});

const renderApp = async () => {
  await app.renderPage();
  NavInitiator.init({
    navLinksContainer: document.querySelector('#navLinks'),
  });
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