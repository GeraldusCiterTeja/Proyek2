const NotificationHelper = {
  async sendSubscriptionToServer(subscription) {
    // Logika mengirim subscription ke API Dicoding
  },

  async subscribeUser() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'MASUKKAN_VAPID_PUBLIC_KEY_DARI_API',
    });
    console.log('Subscribed:', subscription);
  }
};