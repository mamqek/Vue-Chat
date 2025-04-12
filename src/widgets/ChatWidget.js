// src/components/ChatWidget.js
import mainCss from '../assets/main.scss?inline';
import vuetifyStyles from '../dist/chat-widget.css?inline';

import { createApp } from 'vue';
import ChatCircle from '@/components/ChatCircle.vue';

import { createPinia } from 'pinia';
import vuetify from '@/plugins/vuetify'

import { axios, updateAxiosInstance } from '@/plugins/axios'
import { updateSocketInstance } from '@/socketClient';
import { setCommonConfig, getCommonConfig } from '../../config/config.common.js';


export class ChatWidget extends HTMLElement {
    constructor() {
        super();
        this.shadowRootInstance = this.attachShadow({ mode: 'open' });
        this.injectStyles();
    }

    /**
     * Called when the element is added to the DOM.
     * Initializes the Vue app and mounts it inside the shadow DOM.
     */
    async connectedCallback() {
        const container = this.createContainer();
        this.extractAttributes();
        this.initializeVueApp(container);
    }

    /**
     * Injects CSS styles into the shadow DOM.
     * Combines Vuetify and main styles for encapsulated styling.
     */
    injectStyles() {
        const combinedCss = `${vuetifyStyles}\n${mainCss}`;
        const styleEl = document.createElement('style');
        styleEl.textContent = combinedCss;
        this.shadowRootInstance.appendChild(styleEl);
    }

    /**
     * Creates a container element inside the shadow DOM for mounting the Vue app.
     * @returns {HTMLElement} The container element.
     */
    createContainer() {
        const container = document.createElement('div');
        this.shadowRootInstance.appendChild(container);
        return container;
    }

    /**
     * Extracts attributes from the custom element and updates the global configuration.
     * Updates the Axios and Socket.IO instances if necessary.
     */
    extractAttributes() {
        const commonConfig = getCommonConfig();

        const user_id = this.getAttribute('user_id') || commonConfig.USER_ID;
        const token_name = this.getAttribute('token') || commonConfig.TOKEN_NAME;
        const service_url = this.getAttribute('service_url') || commonConfig.SERVICE_URL;

        if (token_name || service_url || user_id) {
            setCommonConfig({ USER_ID: user_id, TOKEN_NAME: token_name, SERVICE_URL: service_url });
            updateSocketInstance();
            updateAxiosInstance();
        }
    }

    /**
     * Initializes the Vue app and mounts it to the provided container.
     * @param {HTMLElement} container - The container element where the Vue app will be mounted.
     */
    initializeVueApp(container) {
        const app = createApp(ChatCircle, { userId: getCommonConfig().USER_ID });
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

/**
 * Initializes the ChatWidget programmatically.
 * Appends a <chat-widget> element to the specified container and configures it.
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
