// src/chatService.ts
import { AppDataSource } from './config/dataSource';
import { Chat } from './entities/Chat';
import { ChatMessage } from './entities/ChatMessage';
import { ChatMessageStatus, ChatMessageStatusEnum } from './entities/ChatMessageStatus';
import { User } from './entities/User';
import { broadcastToUser } from './socket';
import { In, Not } from 'typeorm';
import { getAuthUser } from './auth/context';
import { getParsedConfigVariable, getConfigVariable } from './config/config.server';
// import NodeCache from 'node-cache';

// const cache = new NodeCache();

export class ChatService {

    /**
     * Processes an incoming message.
     * @param data – Incoming data containing receiver_id, text, attachment, replied_to, etc.
     * @returns The saved ChatMessage.
     */
    async processMessage(data: any): Promise<ChatMessage> {

        const authUserId = getAuthUser().id;

        // Create (or get) the chat between the authenticated user and receiver.
        const chat = await this.createChat(data.receiver_id);

        // Create and save the message first
        const chatMessageRepository = AppDataSource.getRepository(ChatMessage);
        let message = chatMessageRepository.create({
            receiver_id: data.receiver_id,
            chat: chat,
            sender_id: authUserId,
            text: data.text || null,
            attachment: data.attachment || null,
            replied_to: data.replied_to || null,
        });
        message = await chatMessageRepository.save(message);

        // Now create the status using the message id and receiver_id
        const statusRepository = AppDataSource.getRepository(ChatMessageStatus);
        const status = statusRepository.create({
            message_id: message.id, // now available
            receiver_id: data.receiver_id,
            status: ChatMessageStatusEnum.SENT, // default or as required
        });
        await statusRepository.save(status);

        // update message.status
        message.status = status;
        await chatMessageRepository.save(message);

        // Determine which unread count to update.
        let myChatUser: 'user1' | 'user2';
        let otherChatUser: 'user1' | 'user2';
        if (authUserId === chat.user1_id) {
            myChatUser = 'user1';
            otherChatUser = 'user2';
        } else {
            myChatUser = 'user2';
            otherChatUser = 'user1';
        }

        // Update chat: set last_message, reset sender's unread count, and increment receiver's.
        const chatRepository = AppDataSource.getRepository(Chat);
        chat.last_message = message;
        chat.updated_at = new Date();
        if (otherChatUser === 'user1') {
            chat.user1_unread_count = (chat.user1_unread_count || 0) + 1;
            chat.user2_unread_count = 0;
        } else {
            chat.user2_unread_count = (chat.user2_unread_count || 0) + 1;
            chat.user1_unread_count = 0;
        }
        await chatRepository.save(chat);

        return message;
    }

  /**
   * Processes file attachments, storing each file and updating the message.
   * @param message – The ChatMessage to update.
   * @param attachments – An array of file objects (e.g. from Multer).
   * @returns The updated ChatMessage.
   */
    async processAttachments(message: ChatMessage, attachments: Express.Multer.File[]): Promise<ChatMessage> {
        const SERVICE_URL = getConfigVariable("SERVICE_URL");
        const UPLOAD_DIR = getConfigVariable("UPLOAD_DIR");

        const files = attachments.map(attachment => ({
            url:  `${SERVICE_URL}/${UPLOAD_DIR}/${attachment.filename}`,  // use the filename saved by multer
            name: attachment.originalname,
            type: attachment.mimetype,
        }));

        message.attachment = files;
        const chatMessageRepository = AppDataSource.getRepository(ChatMessage);
        await chatMessageRepository.save(message);
        
        return message;
    }

    /**
     * Creates (or retrieves an existing) chat between the authenticated user and the receiver.
     * @param receiverId – The other user’s ID.
     * @returns The Chat entity.
     */
    async createChat(receiverId: number): Promise<Chat> {
        const authUserId = getAuthUser().id;

        const chatRepository = AppDataSource.getRepository(Chat);
        let chat = await chatRepository.findOne({
            where: [
                { user1: { id: authUserId }, user2: { id: receiverId } },
                { user1: { id: receiverId }, user2: { id: authUserId } }
            ]
        });

        if (!chat) {
            const userRepository = AppDataSource.getRepository(User);
            const user1 : User | null = await userRepository.findOneBy({ id: authUserId });
            const user2 : User | null = await userRepository.findOneBy({ id: receiverId });

            if (!user1 || !user2) {
                throw new Error("One or both users not found");
            }
            
            chat = chatRepository.create({
                user1,
                user2,
                created_at: new Date(),
                updated_at: new Date(),
                user1_unread_count: 0,
                user2_unread_count: 0
            });
            await chatRepository.save(chat);
            broadcastToUser('chatCreated', chat, receiverId);
        }
        
        return chat;
    }

    /**
     * Retrieves all chats involving the authenticated user.
     * @returns An array of Chat entities.
     */
    async getChats(): Promise<Chat[]> {
        const authUserId = getAuthUser().id;
        
        const chatRepository = AppDataSource.getRepository(Chat);
        const chats = await chatRepository.find({
            where: [
                { user1: { id: authUserId } },
                { user2: { id: authUserId } }
            ],
            order: {
                updated_at: "DESC"
            }
        });

        return chats;
    }

    /**
     * Calculates the total unread messages count for the authenticated user.
     * @returns The total unread count.
     */
    async getUnreadMessagesCount(): Promise<number> {
        const authUserId = getAuthUser().id;

        const chatRepository = AppDataSource.getRepository(Chat);
        const chats = await chatRepository.find({
            where: [
                { user1: { id: authUserId } },
                { user2: { id: authUserId } }
            ]
        });
        
        let unreadCount = 0;
        for (const chat of chats) {
            unreadCount += (chat.user1_id === authUserId ? chat.user1_unread_count : chat.user2_unread_count);
        }
        return unreadCount;
    }

    /**
     * Retrieves the chat history for a given chat.
     * If messages are received by the authenticated user and have status SENT, marks them as read.
     * @param chatId – The chat’s ID.
     * @returns An array of ChatMessage objects.
     */
    async getChatHistory(chatId: number): Promise<ChatMessage[]> {
        const authUserId = getAuthUser().id;
        
        const chatRepository = AppDataSource.getRepository(Chat);
        const chat = await chatRepository.findOne({
            where: { id: chatId },
            relations: ["messages"]
        });

        if (!chat) throw new Error("Chat not found");

        // Filter messages where receiver_id equals authUserId and status is SENT.
        const messages = chat.messages.filter(
            message => message.receiver_id === authUserId && message.status && message.status.status === ChatMessageStatusEnum.SENT
        );
        if (messages.length > 0) {
            const senderId = messages[0].sender_id;
            const messageIds = messages.map(m => m.id);
            await this.markAsRead(chatId, senderId, messageIds);

            // Reload chat with updated messages.
            const updatedChat = await chatRepository.findOne({
                where: { id: chatId },
                relations: ["messages"]
            });
            return updatedChat ? updatedChat.messages : [];
        }
        return chat.messages;
    }

    /**
     * Marks specific messages as read and resets the unread count.
     * @param chatId – The chat’s ID.
     * @param senderId – The sender’s ID.
     * @param messagesIds – An array of message IDs.
     */
    async markAsRead(chatId: number, senderId: number, messagesIds: number[]): Promise<void> {

        const authUserId = getAuthUser().id;

        const chatMessageStatusRepository = AppDataSource.getRepository(ChatMessageStatus);
        await chatMessageStatusRepository.update(
            { message_id: In(messagesIds) },
            { status: ChatMessageStatusEnum.READ }
        );

        broadcastToUser('markAsRead', { chatId, messagesIds }, senderId);
        
        const chatRepository = AppDataSource.getRepository(Chat);
        const chat = await chatRepository.findOne({ where: { id: chatId } });
        if (chat) {
            if (chat.user1_id === authUserId) {
                chat.user1_unread_count = 0;
            } else {
                chat.user2_unread_count = 0;
            }
            await chatRepository.save(chat);
        }
    }

    /**
     * Retrieves otherChatters (users who could be chatted with)  and checks if the authenticated user has a chat with them.
     * @returns An array of otherChatters with an extra property `has_chat`.
     */
    async getOtherChatters(): Promise<User[]> {
        const authUserId = getAuthUser().id;

        const userRepository = AppDataSource.getRepository(User);
        // Use the provided filter if any; otherwise, get all users.
        const otherChatters = await userRepository.find({ where: {
            ...getParsedConfigVariable('user_filter'),
            id: Not(authUserId)
        } });    

        const chatRepository = AppDataSource.getRepository(Chat);
        for (const chatter of otherChatters) {
            const chat = await chatRepository.findOne({
                where: [
                    { user1: { id: authUserId }, user2: { id: chatter.id } },
                    { user1: { id: chatter.id }, user2: { id: authUserId } }
                ]
            });

            (chatter as any).has_chat = !!chat;
        }
        return otherChatters;
    }

//   /**
//    * Adds a message to the email batch for the receiver.
//    * Schedules an email to be sent after 5 minutes if this is the first message.
//    * @param receiverId – The receiver’s ID.
//    * @param message – The ChatMessage to add.
//    */
//   async addToEmailBatch(receiverId: number, message: ChatMessage): Promise<void> {
//     const cacheKey = `email_batch_${receiverId}`;
//     let batch = cache.get<any[]>(cacheKey) || [];
//     batch.push(message);
//     // Cache for 5 minutes (300 seconds)
//     cache.set(cacheKey, batch, 300);
//     if (batch.length === 1) {
//       // Schedule a batch email after 5 minutes.
//       setTimeout(() => {
//         console.log(`Sending batch email to receiver ${receiverId}`, batch);
//         cache.del(cacheKey);
//       }, 5 * 60 * 1000);
//     }
//   }
}

// ALLOW FOR OVERRIDING THE DEFAULT INSTANCE

// Create a singleton instance.
let chatServiceInstance = new ChatService();

// Export a setter to allow overriding the instance.
export function setChatServiceInstance(service: ChatService) {
    chatServiceInstance = service;
}

// Export a getter so that your component and others use the current instance.
export function getChatServiceInstance(): ChatService {
    return chatServiceInstance;
}

// Export the default instance.
export default chatServiceInstance;