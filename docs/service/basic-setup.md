# Basic Setup

The Vue-Chat service provides the backend functionality for the chat component. Follow these steps to set it up:

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd Vue-Chat
npm install
```

## Setup 

First you need to create a file from which you will be stating the service. In this example we will be using chat_service.js 

### Importing 

In this file you need to import the service part of the package "vue-chat/service"

#### Example for CommonJS

```javascript
// for CommonJS
const { startService } = require('vue-chat/service');
```

#### Example for ESM (ECMAScript Modules)

```javascript
// for ESM
import { startService } from 'vue-chat/service';
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