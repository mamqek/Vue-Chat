// src/components/ChatWidget.ts
import '../assets/main.css';  // Global styles (will be bundled into your component)
import { createApp } from 'vue';
import ChatCircle from './ChatCircle.vue';
import { createPinia } from 'pinia';
import vuetify from '../plugins/vuetify'// Adjust path as needed
import { axios } from '../plugins/axios'// Adjust path as needed

export class ChatWidget extends HTMLElement {
    private shadowRootInstance: ShadowRoot;

    constructor() {
        super();
        // Attach a shadow root to encapsulate styles.
        this.shadowRootInstance = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Create a container element in the shadow root for mounting the Vue app.
        const container = document.createElement('div');
        this.shadowRootInstance.appendChild(container);

        

        // Parse an optional advisor-filter attribute.
        const user_id = this.getAttribute('user_id');


        // Create the Vue app, providing the auth user as a prop.
        const app = createApp(ChatCircle, { userId: user_id || null });

        // Install Pinia, axios and Vuetify.
        app.use(createPinia()); 
        app.use(vuetify);
        app.config.globalProperties.$axios = axios;

        // Mount the Vue component into the shadow container.
        app.mount(container);
    }
}

// Register the custom element globally.
if (!customElements.get('chat-widget')) {
    customElements.define('chat-widget', ChatWidget);
}

/**
 * (Optional) Programmatic initialization function.
 * Developers can use this if they prefer initializing the widget via JavaScript rather than using the HTML tag directly.
 */
export function initChatWidget(config: {
    container: HTMLElement;
    authUser?: any;
    apiEndpoint?: string;
}): void {
    // Create the custom element.
    const widget = document.createElement('chat-widget');

    // If an authUser is provided, set it as an attribute.
    if (config.authUser) {
        widget.setAttribute('auth-user', JSON.stringify(config.authUser));
    }

    // Append the widget to the provided container.
    config.container.appendChild(widget);
}
