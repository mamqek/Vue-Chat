// Import and re-export service functions
import { startService, stopService } from './src/server';
export { startService, stopService };

import { initializeData } from './src/database/initializeData';
export { initializeData };

// Import and re-export chatService and related functions/classes
import chatServiceInstance, { 
  setChatServiceInstance, 
  getChatServiceInstance, 
  ChatService 
} from './src/chatService';
export { chatServiceInstance, setChatServiceInstance, getChatServiceInstance, ChatService };

import { handleMigrations, revertMigrations } from './src/database/migrationUtils';
export { handleMigrations, revertMigrations };
