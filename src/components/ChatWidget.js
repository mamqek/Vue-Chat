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
 * @param {HTMLElement} config.container - The DOM element where the widget will be appended.
 * @param {*} [config.authUser] - (Optional) An object with authentication or user details.
 *                                This value will be JSON-stringified and set as the "auth-user" attribute.
 * @param {string} [config.apiEndpoint] - (Optional) A URL string specifying the API endpoint the widget should use.
 */
export function initChatWidget(config) {
  // Create the custom chat widget element.
  const widget = document.createElement('chat-widget');

  // If an authUser is provided, set it as a JSON string attribute.
  if (config.authUser) {
    widget.setAttribute('auth-user', JSON.stringify(config.authUser));
  }

  // (Optional) If an API endpoint is provided, set it as an attribute.
  // Uncomment the next lines if your widget expects an "api-endpoint" attribute.
  // if (config.apiEndpoint) {
  //   widget.setAttribute('api-endpoint', config.apiEndpoint);
  // }

  // Append the widget to the specified container element.
  config.container.appendChild(widget);
}