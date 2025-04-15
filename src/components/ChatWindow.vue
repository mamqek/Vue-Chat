<template>
    <div id="chat_window" class="tw-@container/window tw-p-4 tw-gap-8 tw-flex tw-size-full tw-rounded-md tw-relative" v-bind="$attrs">
        <ChatSidebar></ChatSidebar>
        <div class="tw-flex-grow tw-z-[1]">
            <Chat></Chat>
        </div>
    </div> 
</template>

<script>
import { Button } from '@/shadcn-vue-components/button';
import { useChatStore } from '@/stores/useChatStore';
import Chat from './Chat.vue';
import ChatSidebar from './ChatSidebar.vue';

// @input="chatStore.setCurrentChatId(Number($event.target.value))"

// sender: int
// receiver: int
// message: string
// attachment: JSON {type: string, url: string}
// status: string (sent, delivered, read)
// created_at: timestamp

// in store mounted to app onload 
// - subscribe to private channel 
// - send api call to get and obj which has all chats in which user is either user1 or user2 are retrived and field total_unread which is a sum of unread_count of all their chats
// - set to be persisted
// put red circle with number of unread messages on link to chat, 
// when chat window is open, make same call as on previous step
// - red circle on chat with person (unread_count) and last message is displayed
// when chat with person is opened,
// - send backend (with chat_id and user_id) request to retrieve 50 messages of this chat, 
// - check messages which have receiver as user and status as sent, update their status to read
// - when data is received from backend, join presence chat channel (chat.{chat_id}) to let opponent know that u r in the chat

// when message is sent, send api call "send-message" to backend to create a message and update last_ message_id on chat table
// - if opponent is not in chat 
//   increment unread_count on chat table


export default {
    name: "ChatWindow",

    setup() {
        const chatStore = useChatStore();
        return { chatStore };
    },

    mounted() {
        if (this.initStore) useChatStore().init(this.userId);     
        if (this.preOpenChatId) useChatStore().setCurrentChatId(this.preOpenChatId);  
    },

    props: {
        userId: {
            type: [String, Number],
            required: true,
        },
        preOpenChatId: {
            type: Number,
            default: null,
        },
        initStore: {
            type: Boolean,
            default: true,
        }
    },

    components: {
        Button,
        Chat,
        ChatSidebar
    },
}
</script>

<style>
.panel-content:has(#chat_window) { 
    padding: 0;
}
</style>