import CONFIG from '../config';

const ApiSource = {
  async register(name, email, password) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  async login(email, password) {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async getAllStoriesWithLocation() {
    const token = localStorage.getItem('userToken'); 

    if (!token) {
      window.location.hash = '/login';
      return { error: true, message: 'No token found', listStory: [] };
    }

    const response = await fetch(`${CONFIG.BASE_URL}/stories?location=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  async postStory(formData) {
    const token = localStorage.getItem('userToken');
    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return response.json();
  },
};

export default ApiSource;