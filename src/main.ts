import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import '@primevue/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import 'primevue/resources/primevue.min.css';
import './assets/styles.scss';

const app = createApp(App);

app.use(router);
app.use(PrimeVue, { ripple: true });

app.mount('#app');
