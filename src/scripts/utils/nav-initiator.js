import PushHelper from './push-helper';

const NavInitiator = {
  init({ navLinksContainer }) {
    this._navLinksContainer = navLinksContainer;
    this._renderNav();
  },

  _renderNav() {
    const token = localStorage.getItem('userToken');
    
    if (!this._navLinksContainer) return;

    if (token) {
      this._navLinksContainer.innerHTML = `
        <li><button id="subscribePush">🔔 Aktifkan Notifikasi</button></li>
        <li><a href="#/home">Beranda</a></li>
        <li><a href="#/add-story">Tambah Cerita</a></li>
        <li><button id="btnLogout" class="btn-logout">Logout</button></li>
      `;

      this._initialLogoutEvent();
    } else {
      this._navLinksContainer.innerHTML = `
        <li><a href="#/login">Login</a></li>
        <li><a href="#/register">Daftar</a></li>
      `;
    }
  },

  _initialLogoutEvent() {
    const btnLogout = document.querySelector('#btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        localStorage.removeItem('userToken');
        alert('Anda telah logout');
        window.location.hash = '/login';
        this._renderNav(); 
      });
    }
  }
};

const btnSubscribe = document.querySelector('#subscribePush');
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

export default NavInitiator;