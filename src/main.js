import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

import { axios } from './plugins/axios'
app.config.globalProperties.$axios = axios;

import { createPinia } from 'pinia'
app.use(createPinia())

import vuetify from './plugins/vuetify'
app.use(vuetify);



app.mount('#app')
