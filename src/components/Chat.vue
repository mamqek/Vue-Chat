<template>
    <div :class="{' tw-opacity-0 tw-pointer-events-none @3xl/window:tw-opacity-100 @3xl/window:tw-pointer-events-auto' : !chatStore.currentChat}" class="tw-@container/chat tw-absolute @3xl/window:tw-relative tw-bg-background @3xl/window:tw-bg-transparent tw-p-4 @3xl/window:tw-p-0 tw-inset-0 tw-z-20 tw-flex tw-flex-col tw-max-h-full tw-h-full">
        <template v-if="loadedChatId">
            <!-- Header -->
            <div class="tw-flex tw-items-center tw-gap-4 tw-border-muted-foreground">
                <Button @click="chatStore.setCurrentChatId(null)"
                    variant="outline" 
                    size="icon" 
                    class="@3xl/window:tw-hidden" 
                >
                    <i class='bx bx-arrow-back'></i>
                </Button>

                <a v-if="chatStore.currentReceiver" class="tw-group tw-relative tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-4 tw-py-4 tw-text-current" :href="`/users/${chatStore.currentReceiver.id}/profile`">
                    <span class="tw-relative tw-flex tw-shrink-0 tw-h-12 tw-w-12">
                        <img class="tw-aspect-square tw-overflow-hidden tw-rounded-full tw-size-full" :alt="chatStore.currentReceiver.full_name + `'s avatar'`" :src="chatStore.currentReceiver.avatar" />
                        <div v-if="chatStore.usersOnline.find(id => id == chatStore.currentReceiver.id)" class="tw-w-3 tw-h-3 tw-absolute tw-rounded-full tw-end-0 tw-bottom-0 tw-bg-green-400"></div>
                    </span>
                    <div class="tw-min-w-0 tw-flex-grow">
                        <span class="tw-block tw-font-semibold">{{chatStore.currentReceiver.full_name}}</span>
                        <span class="tw-block tw-truncate tw-text-start tw-text-muted-foreground">{{ chatStore.currentReceiver.bio }}</span>
                    </div>
                </a>
            </div>
            
            <!-- Scrollable Area -->
            <div ref="chatContainer" class="hide-scrollbar tw-max-h-full tw-h-full tw-overflow-y-auto tw-w-full tw-py-4 tw-flex-grow ">
                <div v-if="!chatStore.chatHistory[loadedChatId]" class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-h-full" >
                    <i class='bx bx-loader-alt bx-spin tw-text-8xl tw-text-primary' ></i>
                    <p class="tw-text-4xl tw-font-semibold tw-text-primary">Loading chat... Please wait</p>
                </div>
                <div v-else-if="chatStore.chatHistory[loadedChatId].error">{{ error }}</div>
                <div v-else-if="chatStore.chatHistory[loadedChatId].length == 0" class="tw-flex tw-flex-col tw-w-1/2 tw-h-full tw-mx-auto tw-items-center tw-justify-center">
                    <!-- <img src="/assets/default/img/no-results/promotion.png" alt="No messages yet"> -->
                    <p class="tw-text-2xl tw-font-semibold tw-text-muted-foreground tw-text-center">Write your first message in the chat</p>
                </div>
                <div v-else class="tw-flex tw-flex-col tw-items-start tw-justify-end tw-space-y-10 tw-py-8">
                    <ChatMessage 
                        v-for="message in chatStore.chatHistory[loadedChatId]" 
                        :key="message.id" 
                        :message="message" 
                        @open-attachment="attachmentDialogEvent"
                        @loaded="scrollToBottom"
                    />
                </div>
            </div>

            <!-- Input-->
            <ChatInput />
        </template>
        <template v-else>
            <div class="tw-flex tw-flex-col tw-w-1/2 tw-h-full tw-mx-auto tw-items-center tw-justify-center">
                <!-- <img src="/assets/default/img/no-results/support.png" alt="No chat selected"> -->
                <p class="tw-text-2xl tw-font-semibold tw-text-muted-foreground tw-text-center">Select a chat to start messaging</p>
            </div>
        </template>
    </div>

    <Dialog
        v-model="attachmentDialog"
        name="View attachments"
    >
        <template #content>
            <v-card-text>
                <div class="tw-flex tw-flex-wrap tw-gap-2" id="attachment_dialog">
                    <div class="tw-min-w-28 tw-flex-1 tw-relative tw-group hover:tw-opacity-80 tw-my-auto" v-for="attachment in attachmentDialogData" :key="attachment.name">
                        <img v-if="attachment.type.startsWith('image')" :src="'/' + attachment.url" :alt="attachment.name" class="tw-w-full tw-h-auto tw-rounded-md" />
                        <div v-else class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-border tw-rounded-md tw-p-4 tw-text-muted-foreground tw-aspect-square">
                            <i v-if="attachment.type.endsWith('pdf')" class='bx bxs-file-pdf tw-text-5xl'></i>
                            <i v-else class='bx bxs-file-doc tw-text-5xl'></i>
                            <p class="tw-text-center tw-break-all">{{ attachment.name }}</p>
                        </div>
                        <a 
                            class="tw-absolute tw-top-1/2 tw-left-1/2 tw-transform tw-translate-x-[-50%] tw-translate-y-[-50%] tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity tw-text-black"
                            :download="attachment.name"
                            :href="attachment.url"
                        >
                            <i class='bx bxs-download tw-text-5xl tw-text-primary'></i>
                        </a>
                    </div>
                </div>
            </v-card-text>
        </template>

        <template #actions>
            <Button class="tw-mx-auto" @click="downloadAllAttachments">Download All</Button>
        </template>
    </Dialog>
</template>

<script>
import { Button } from '@/shadcn-vue-components/button';
import { useChatStore } from '@/stores/useChatStore';
import ChatMessage from './ChatMessage.vue';
import { ScrollArea } from '@/shadcn-vue-components/scroll-area';
import ChatInput from './ChatInput.vue';
import Dialog from '@/elements/Dialog.vue';

export default {
    name: 'Chat',    
    
    setup() {
        const chatStore = useChatStore();
        return { chatStore };
    },

    data() {
        return {
            attachmentDialog: false,
            attachmentDialogData: null,
            loadedChatId: null,
        };
    },

    watch: {
        // Watch for changes in the store's currentChat (not currentChatId because with watching currentChat, we also wait for this.chats to be loaded)
        'chatStore.currentChat': {
            immediate: true, // Trigger on initial load
            async handler(newChat) {
                console.log('Current chat changed');
                if (!newChat) return console.log('Chat isn\'t loaded yet');
                if (this.loadedChatId === newChat.id) return console.log('Chat already loaded');
                
                this.loadedChatId = newChat.id;
                await this.chatStore.openChat(newChat.id);
            },
        },

        // Watch chat history to scroll to bottom when new messages are added
        'chatStore.chatHistory': {
            deep: true, // Ensures nested objects trigger updates
            immediate: true,
            handler(newHistory) {
                const chatId = this.chatStore.currentChat?.id;
                if (!chatId || !newHistory[chatId]) return;
                this.$nextTick(() => this.scrollToBottom());
            }
        }
    },


    components: {
        Button,
        ChatMessage,
        ScrollArea,
        ChatInput,
        Dialog,
    },

    async mounted() {
        console.log('Chat component mounted');
    },

    methods: {
        scrollToBottom() {
            const container = this.$refs.chatContainer;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        },

        attachmentDialogEvent(attachmentData) {
            this.attachmentDialog = true;
            this.attachmentDialogData = attachmentData;
        },

        downloadAllAttachments() {
            const links = document.querySelectorAll('#attachment_dialog a'); // Select all <a> tags inside the dialog
            links.forEach(link => {
                link.click(); // Trigger a click for each link
            });
        }
    },
};
</script>


