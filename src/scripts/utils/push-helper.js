const PushHelper = {
  async subscribe() {
    // 1. Cek apakah browser mendukung Service Worker dan Notifikasi
    if (!('serviceWorker' in navigator) || !('Notification' in window)) {
      alert('Browser Anda tidak mendukung fitur notifikasi.');
      return null;
    }

    // 2. Minta Izin Notifikasi secara eksplisit ke pengguna (Memunculkan Popup)
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Izin notifikasi ditolak. Anda tidak akan menerima pemberitahuan.');
      return null;
    }

    // 3. Jika izin diberikan ('granted'), barulah proses subscribe dijalankan
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const rawVapidKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlB64ToUint8Array(rawVapidKey),
      });

      // 4. Kirim data langganan ke API Dicoding
      await this._sendSubscriptionToApi(subscription);
      return subscription;
    } catch (error) {
      console.error('Gagal melakukan subscribe push notification:', error);
      throw error;
    }
  },

  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) return;

      // 1. Kirim request DELETE ke API Dicoding sebelum membatalkan di browser
      await this._sendUnsubscriptionToApi(subscription.endpoint);

      // 2. Batalkan langganan di browser
      await subscription.unsubscribe();
    } catch (error) {
      console.error('Gagal membatalkan push notification:', error);
    }
  },

  async _sendSubscriptionToApi(subscription) {
    const token = localStorage.getItem('userToken');
    const subscriptionJSON = subscription.toJSON();

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscriptionJSON.endpoint,
        keys: {
          auth: subscriptionJSON.keys.auth,
          p256dh: subscriptionJSON.keys.p256dh,
        }
      }),
    });
    return response.json();
  },

  async _sendUnsubscriptionToApi(endpoint) {
    const token = localStorage.getItem('userToken');
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    return response.json();
  },

  _urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },
};

export default PushHelper;