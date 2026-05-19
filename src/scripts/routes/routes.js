import Home from '../pages/home/home-page';
import FavoritePage from '../pages/favorite';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AddStoryPage from '../pages/add-story';

const routes = {
  '/': Home,
  '/home': Home,
  '/login': LoginPage,
  '/favorite': FavoritePage,
  '/register': RegisterPage,
  '/add-story': AddStoryPage,
};

export default routes;