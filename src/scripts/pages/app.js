import UrlParser from '../routes/url-parser';
import routes from '../routes/routes';

class App {
  constructor({ content }) {
    this._content = content;
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const page = routes[url] || routes['/'];

    const render = async () => {
      this._content.innerHTML = await page.render();
      await page.afterRender();
    
      const mainContent = document.querySelector('#mainContent');
      mainContent.focus(); 
      window.scrollTo(0, 0);
    };

    if (document.startViewTransition) {
      document.startViewTransition(render);
    } else {
      render();
    }
  }
}

export default App;