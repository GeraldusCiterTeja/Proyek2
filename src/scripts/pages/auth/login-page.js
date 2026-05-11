import ApiSource from '../../data/api';

const LoginPage = {
  async render() {
    return `
      <section class="auth-container">
        <h2>Login</h2>
        <form id="loginForm">
          <label for="email">Email</label>
          <input type="email" id="email" required>
          
          <label for="password">Password</label>
          <input type="password" id="password" required>
          
          <button type="submit" id="btnLogin">Login</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector('#loginForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;
      const response = await ApiSource.login(email, password);
        
      if (!response.error) {
        localStorage.setItem('userToken', response.loginResult.token);
        alert('Login Berhasil!');
        window.location.hash = '/home';
      } else {
        alert(response.message);
      }
    });
  },
};

export default LoginPage;