const PushHelper = {
  async subscribe() {
    const registration = await navigator.serviceWorker.ready;
    const rawVapidKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'.trim();
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this._urlB64ToUint8Array(
        'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
      ),
    });

    await this._sendSubscriptionToApi(subscription);
    return subscription;
  },

  async unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) return;

    // 1. Kirim request DELETE ke API Dicoding sebelum membatalkan di browser
    await this._sendUnsubscriptionToApi(subscription.endpoint);

    // 2. Batalkan langganan di browser
    await subscription.unsubscribe();
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

  async showLocalNotification(title, options) {
    // Cek apakah fitur Service Worker didukung dan izin notifikasi sudah diberikan
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
    }
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