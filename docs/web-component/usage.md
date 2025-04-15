# Usage

The AIOChatWC web component can be used in two ways:

## Using the `<chat-widget>` HTML Element

Embed the chat widget directly in your HTML by adding the `<chat-widget>` element and providing the required attributes.

Example:

```html
<chat-widget user_id="123" service_url="https://your-backend.com"></chat-widget>
```

## Using the `initChatWidget` Function

Initialize the chat widget programmatically using the `initChatWidget` function:

```javascript
import { initChatWidget } from 'aio-chat-wc';

initChatWidget({
  user_id: 123,
  service_url: 'https://your-backend.com',
  container: document.querySelector('#chat-container')
});
```