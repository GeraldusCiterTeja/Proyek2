import Home from '../pages/home/home-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AddStoryPage from '../pages/add-story';

const routes = {
  '/': Home,
  '/home': Home,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/add-story': AddStoryPage,
};

export default routes;