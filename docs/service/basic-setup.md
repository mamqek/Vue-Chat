# Basic Setup

The AIOChatWC service provides the backend functionality for the chat component. Follow these steps to set it up:

## Installation

Install the package:

```bash
npm install aio-chat-wc
```
## Setup 

First you need to create a file from which you will be stating the service. In this example we will be using chat_service.js 

### Importing 

In this file you need to import the service part of the package "aio-chat-wc/service"

#### Example for CommonJS

```javascript
const { startService } = require('aio-chat-wc/service');
```

#### Example for ESM (ECMAScript Modules)

```javascript
import { startService } from 'aio-chat-wc/service';
```

### Starting service 

You should import startService function and use it. You can provide config to it if customizing the service. 
You can know more about the config in [here](./config.md)

```javascript
startService(config)
.then(() => {
    console.log("Chat service started successfully.")
})
.catch((err) => console.error("Failed to start chat service:", err));
```

## Executing the file  
To start the service, add a command to your `package.json`:

```json
"scripts": {
  "start:service": "node path/to/chat_service.js"
}
```

Replace `path/to/chat_service.js` with the actual path to your service file.