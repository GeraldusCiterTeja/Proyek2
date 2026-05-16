const PushHelper = {
  async subscribe() {
    const registration = await navigator.serviceWorker.ready;
    
    // 1. Minta langganan ke browser menggunakan VAPID Key
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this._urlB64ToUint8Array(
        'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r21CnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'
      ),
    });

    // 2. Kirim data subscription ke API Dicoding (Kriteria Advance)
    await this._sendSubscriptionToApi(subscription);
  },

  async _sendSubscriptionToApi(subscription) {
    const token = localStorage.getItem('userToken');
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription),
    });
    return response.json();
  },

  // Fungsi pembantu untuk mengubah string VAPID ke format yang dimengerti browser
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