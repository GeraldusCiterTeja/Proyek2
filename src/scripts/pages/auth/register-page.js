import ApiSource from '../../data/api';

const RegisterPage = {
  async render() {
    return `
      <section class="auth-container">
        <h2>Daftar Akun Baru</h2>
        <form id="registerForm">
          <div class="form-group">
            <label for="name">Nama Lengkap</label>
            <input type="text" id="name" required minlength="3">
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required minlength="8">
          </div>
          <button type="submit" id="btnRegister">Daftar</button>
        </form>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector('#registerForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.querySelector('#name').value;
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
        const response = await ApiSource.register(name, email, password);
        if (!response.error) {
          alert('Registrasi berhasil! Silakan login.');
          window.location.hash = '/login';
        } else {
          alert(`Gagal: ${response.message}`);
        }
      } catch (error) {
        console.error('Error during registration:', error);
      }
    });
  },
};

export default RegisterPage;