const AuthHelper = {
  logout() {
    localStorage.removeItem('userToken');
    window.location.hash = '/login';
    window.location.reload(); // Refresh untuk memperbarui menu
  }
};
export default AuthHelper;