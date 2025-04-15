# Basic Setup

The Vue-Chat web component can be quickly set up in your application. Follow these steps to get started:

## Installation

Install the package via npm:

```bash
npm install vue-chat
```

Also, ensure Vue.js is installed in your project:

```bash
npm install vue
```

## Usage

### Using the `<chat-widget>` HTML Element

Add the following to your HTML:

```html
<chat-widget user_id="1"></chat-widget>
```

### Using the `initChatWidget` Function

Alternatively, initialize the chat widget programmatically:

```javascript
import { initChatWidget } from 'vue-chat';

initChatWidget({
  user_id: 1,
  container: document.querySelector('#chat-container')
});
```