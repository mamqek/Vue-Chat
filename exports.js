import { getConfig, setConfig } from './service/src/config/config.server';
export { getConfig, setConfig };

// Import and re-export service functions
import { startService, stopService } from './service/src/server';
export { startService, stopService };

import { initializeData } from './service/src/config/initializeData';
export { initializeData };

// import { BaseUser } from './service/src/entities/User';
// export { BaseUser };

// Import and re-export chatService and related functions/classes
import chatService, { 
  setChatServiceInstance, 
  getChatServiceInstance, 
  ChatService 
} from './service/src/chatService';
export { chatService, setChatServiceInstance, getChatServiceInstance, ChatService };
