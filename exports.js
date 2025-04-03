// Import and re-export service functions
import { startService, stopService } from './service/src/server';
export { startService, stopService };

import { initializeData } from './service/src/database/initializeData';
export { initializeData };

// Import and re-export chatService and related functions/classes
import chatService, { 
  setChatServiceInstance, 
  getChatServiceInstance, 
  ChatService 
} from './service/src/chatService';
export { chatService, setChatServiceInstance, getChatServiceInstance, ChatService };

import { handleMigrations } from 'service/src/database/migrationUtils';
export { handleMigrations };
