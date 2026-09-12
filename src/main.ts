import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { layoutConfig } from '@/layout/composables/layout';
import { syncPrimeVueTheme } from '@/layout/composables/primevueBridge';

import '@/assets/tailwind.css';
import '@/assets/styles.scss';

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

// First sync of PrimeVue's theme with the persisted picker choice; later changes flow through the watcher.
syncPrimeVueTheme(layoutConfig);

app.mount('#app');
