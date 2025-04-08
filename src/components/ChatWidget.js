// src/components/ChatWidget.js
import mainCss from '../assets/main.scss?inline';
import vuetifyStyles from '../dist/chat-widget.css?inline';

import { createApp } from 'vue';
import ChatCircle from './ChatCircle.vue';

import { createPinia } from 'pinia';
import vuetify from '../plugins/vuetify'
import { axios } from '../plugins/axios'

export class ChatWidget extends HTMLElement {

    constructor() {
        super();
        // Attach a shadow root to encapsulate styles.
        this.shadowRootInstance = this.attachShadow({ mode: 'open' });

        // Inject CSS directly into the shadow root
        console.log("main", mainCss);
        console.log("compiled", vuetifyStyles);
        const combinedCss = `${vuetifyStyles}\n${mainCss}`;
        const styleEl = document.createElement('style');
        styleEl.textContent = combinedCss;
        this.shadowRootInstance.appendChild(styleEl);
    }

    async connectedCallback() {
        // Create a container element in the shadow root for mounting the Vue app.
        const container = document.createElement('div');
        this.shadowRootInstance.appendChild(container);

        // Parse an optional advisor-filter attribute.
        const user_id = this.getAttribute('user_id');

        // Create the Vue app, providing the auth user as a prop.
        const app = createApp(ChatCircle, { userId: user_id || null });

        // Install Pinia, axios and Vuetify.
        app.use(vuetify);
        
        app.config.globalProperties.$axios = axios;
        app.use(createPinia()); 
        app.mount(container);
    }
}

// Register the custom element globally.
if (!customElements.get('chat-widget')) {
    customElements.define('chat-widget', ChatWidget);
}

// TODO: update to new setup
/**
 * Initializes the ChatWidget programmatically.
 *
 * This function creates and appends a <chat-widget> element to the specified container.
 * It allows you to initialize the widget via JavaScript instead of placing the HTML tag manually.
 *
 * @param {Object} config - Configuration options for the chat widget.
 * @param {HTMLElement} config.CONTAINER - The DOM element where the widget will be appended.
 */
export function initChatWidget(config) {
    if (!config) {
        console.error("ChatWidget: No config provided to initChatWidget(). Please provide a valid config object or this function will not work.");
        return;
    }

    if (!config.CONTAINER) {
        console.error("ChatWidget: No container provided. Please provide a valid container element or use the HTML tag.");
        return;
    }

    setCommonConfig(config);

    const widget = document.createElement('chat-widget');
    widget.setAttribute('user_id', getCommonConfig().USER_ID);
    config.CONTAINER.appendChild(widget);
}
