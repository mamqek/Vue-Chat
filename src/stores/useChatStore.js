import { defineStore } from 'pinia';
import { axios } from '../plugins/axios'
import { socket } from '@/socketClient';

export const useChatStore = defineStore('chat', {
    state: () => ({
        user_id: null,
        receivingChannel: null,
        chats: [],  // Stores all chat objects
        currentChatId: null, // Stores the currently selected chat ID
        chatHistory: {}, // Stores the chat history
        usersInChat: [], 
        usersOnline: []
    }),
    // persist: {
    //     enabled: true,
    //     paths: ['currentChatId', 'chats', 'user_id']  // TODO: put chats (maybe chatHistory , but then always load it in openChat())
    // },
    getters: {        
        chatsLoaded(state) {
            return state.chats.length > 0;
        },
        currentChat(state) {
            console.log('Getting current chat:', state.currentChatId, state.currentChatId && state.chats.length > 0 ? state.chats.find(chat => chat.id == state.currentChatId) : null);
            return state.currentChatId && state.chats.length > 0 ? state.chats.find(chat => chat.id == state.currentChatId) : null;
        },
        currentReceiver(state) {
            return state.currentChat ? 
                (state.currentChat.user1.id == state.user_id ? state.currentChat.user2 : state.currentChat.user1) 
            : null;
        },
        totalUnreadCount: (state) => {            
            return state.chats.length > 0 ? state.chats.reduce((sum, chat) => sum + (chat[state.getChatUserColumnName(chat.id) + '_unread_count'] || 0), 0) : 0;
        },
    },
    actions: {

        async auth(user_id) {

            if (user_id) {
                // To create cookie with user_id, so service knows who is logged in
                // console.log('Logging in with user_id:', user_id);
                await axios.post("/login", { user_id })
                .then(({ data }) => {
                    this.init(user_id);
                })
            } else {
                // To get user_id from cookie from developer's authentication flow
                await axios.get("/user")
                .then(({ data }) => {
                    this.init(data.user.id);
                })
            }

            return
        },

        init(user_id) {
            // if logged in from another account from the same browser, clean the store
            if (this.user_id != user_id) this.cleanStore();
            
            if (!this.chatsLoaded) this.fetchChats();
            this.user_id = user_id;
            this.joinReceivingChannel(user_id);
            this.joinOnlineStatusChannel();
        },


        joinReceivingChannel(user_id) {
            // Join a private room via Socket.IO
            socket.emit('joinPrivateChannel', { user_id });
            // console.log('Joined private channel for user:', user_id);

            // Bind event handlers directly on the socket connection
            socket.on('messageSent', this.messageReceived);
            socket.on('markAsRead', this.markedAsRead);
            socket.on('chatCreated', this.addChat);
        },

        joinOnlineStatusChannel() {
            // Emit an event to join the online users room
            socket.emit('joinOnlineChannel', { user_id: this.user_id });
        
            // Listen for the full online users list from the server
            socket.on('onlineUsers', (users) => {
                this.usersOnline = users;
            });
        
            // Listen for individual user join/leave events
            socket.on('userJoined', (user) => {
                if (!this.usersOnline.includes(user.id)) {
                    this.usersOnline.push(user.id);
                }
            });
            socket.on('userLeft', (user) => {
                this.usersOnline = this.usersOnline.filter(id => id !== user.id);
            });
        },

        // Sometimes after login this call replies with login page html, so it needs to be retried
        async fetchChats(retries = 3, delay = 1000) {
            try {
                const { data } = await axios.get("/chats");

                if (!Array.isArray(data)) {
                    if (retries > 0) {
                        console.warn('Invalid data received. Retrying fetching chats...');
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return await this.fetchChats(retries - 1, delay);
                    } else {
                        console.error('Failed to fetch chats after multiple attempts');
                        return;
                    }
                }

                this.chats = data;
                // console.log('Chats fetched!');
            } catch (error) {
                console.error("Error fetching chats:", error);
                if (retries > 0) {
                    console.warn('Retrying fetching chats due to error...');
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return await this.fetchChats(retries - 1, delay);
                }
            }
        },


        // Called when chat is opened (selects it in chatSidebar or has chat_id saved and opens chatWindow)
        async openChat(chat_id) {
            this.setCurrentChatId(chat_id);
            // Could be already fetched and up to date as MarkAsRead and MessageSent event are listened
            if (!this.chatHistory[chat_id]) {
                await this.fetchChatHistory(chat_id);
            } else {
                // If the chat history is already loaded, messages wont be marked as read in the backend, so do it here and notify the backend
                this.markAsRead();
            }
        },

        async fetchChatHistory(chat_id) {
            if (!chat_id) return console.error('Chat ID is required.');
            
            await axios.get(`/openChat/${chat_id}`)
            .then(({ data }) => {
                // console.log('Chat history fetched');
                this.chatHistory[chat_id] = data;
                let chat = this.chats.find(chat => chat.id == chat_id);
                chat[this.getChatUserColumnName(chat_id) + '_unread_count'] = 0;
                chat.last_message = data.at(-1);
            })

            return this.chatHistory[chat_id];
        },

        // When receive message from another user 
        messageReceived(message) {
            let chat_id = message.chat.id;
            // console.log('Message received:', message, chat_id, this.currentChatId);
            this.addMessage(message, chat_id);

            // If the chat is opened, mark the message as read
            if (this.currentChatId == chat_id) {
                this.markAsRead(message);
            } else {
                let chat = this.chats.find(chat => chat.id == chat_id);
                chat[chat.user1.id == this.user_id ? 'user1_unread_count' : 'user2_unread_count']++;                
            }
        },

        // Activated in callback when user sends a message
        messageSentConfirmed(message) {
            // console.log('Message sent:', message);
            this.addMessage(message, message.chat.id);
        },

        addMessage(message, chat_id) {
            // console.log('Adding message:', message, chat_id);
            
            // Don't add the message if the chat history is not loaded, so it will be fetched when the chat is opened
            if (!this.chatHistory[chat_id]) return;

            this.chatHistory[chat_id].push(message); // Append the item to the array

            // Update the chat info 
            let chat = this.chats.find(chat => chat.id == chat_id);
            chat.last_message = message;
            // Move chat on first place
            this.chats = this.chats.filter(c => c.id !== chat_id);
            this.chats.unshift(chat);      
        },

        // User sends message to the chat, 
        //  ----opponent is 
        // - In chat: on receive mark as read and send api to let user know
        // - Closed without reload: update unread count, mark as read on open
        // - Havent opened: update unread count, marked as read in backend when loading chat
        // --- sender is 

        // Opponent marks user's message as read
        // - when user is currently in chat, sends API call to raise MarkAsRead event
        // - when user calls openChat() by 
        // -- loading chat history in the backend
        // -- or if history is loaded,  
        async markAsRead(message = null) {
            let updatedMessages = [];
            let senderId;
            let chatId = this.currentChatId;

            if (message) {
                message.status.status = "read";
                senderId = message.sender_id;
                updatedMessages.push(message.id);
            } else {
                //  Collect ids of all messages that are not read
                const messages = this.chatHistory[chatId];
                if (!messages || messages.length == 0) return;
                let i = messages.length - 1;
                senderId = messages[i].sender_id;
                while (i >= 0 && messages[i].status.status !== 'read' && messages[i].sender_id != this.user_id) {
                    const { id, status } = messages[i];
                    status.status = 'read'; // Mark message as read
                    updatedMessages.push(id);
                    i--;
                }
            }

            if (updatedMessages.length == 0) return;
            // console.log('Marking as read:', updatedMessages);
            
            await axios.post(`/markAsRead`, {
                chatId: chatId,
                senderId: senderId,
                messagesIds: updatedMessages
            }).then(() => {
                this.currentChat[this.getChatUserColumnName(chatId) + '_unread_count'] = 0;
            })
        },

        // Users messages are marked as read 
        // -- when user loads chat history in the backend before returning it
        // -- when user has history loaded (unloads with page reload) and receives a MarkAsRead event
        markedAsRead(data) {
            let chat_id = data.chatId;
            let messagesIdsSet = new Set(data.messagesIds);
            // console.log('Marked as read:', messagesIdsSet);

            if (!this.chatHistory[chat_id]) return;

            this.chatHistory[chat_id].forEach(message => {
                if (messagesIdsSet.has(message.id)) {
                    message.status.status = 'read';
                }
            });
        },

        setCurrentChatId(chat_id) {
            this.currentChatId = chat_id;
        },

        leaveReceivingChannel() {
            if (this.receivingChannel) {
                // Tell the server you’re leaving your private channel
                socket.emit('leavePrivateChannel', { user_id: this.user_id });
                       
                // Remove event listeners from the socket connection
                socket.off('messageSent', this.messageReceived);
                socket.off('markAsRead', this.markedAsRead);
                socket.off('chatCreated', this.addChat);
                this.receivingChannel = null; // Clear the instance
            }
        },

        createChat(advisor_id) {
            axios.post('/createChat', { advisor_id })
            .then(({ data }) => {
                this.addChat(data.chat);
            })
        },

        addChat(chat) {
            this.chats = this.chats.some(c => c.id === chat.id) ? this.chats.map(c => c.id === chat.id ? chat : c) : [...this.chats, chat];
            this.openChat(chat.id);
        },

        getChatUserColumnName(chat_id) {
            if (!this.chatsLoaded) return console.log('Chats are not loaded');
            let chat = this.chats.find(chat => chat.id == chat_id);
            return this.user_id == chat.user1.id ? 'user1' : 'user2';
        },

        cleanStore() {
            this.user_id = null;
            this.leaveReceivingChannel();
            this.receivingChannel = null;
            this.chats = [];
            this.currentChatId = null;
            this.chatHistory = {};
            this.usersInChat = [];
            this.usersOnline = [];
        }
    },
});
