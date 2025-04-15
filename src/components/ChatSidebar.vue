<template>
    <div class="tw-flex-none tw-w-full @3xl/window:tw-w-80 @5xl/window:tw-w-96 tw-flex tw-flex-col tw-shadow-base tw-rounded-lg tw-border tw-bg-card tw-text-card-foreground">

        <div class="tw-flex tw-flex-col tw-space-y-1.5 tw-p-6 tw-py-4 @3xl/window:tw-py-6">
            <div class="tw-flex tw-items-center tw-justify-between">
                <h3 class="tw-text-lg tw-leading-none tw-tracking-tight tw-font-bold">Chats</h3>
                <button @click="newChat" class="tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-medium tw-ring-offset-background tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-border tw-border-input tw-bg-background hover:tw-bg-accent hover:tw-text-accent-foreground tw-h-10 tw-px-4 tw-py-2" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus tw-w-4 tw-h-4 tw-me-2"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
                    New
                </button>
            </div>
        </div>

        <div class="tw-p-0 tw-flex-grow tw-flex tw-flex-col">
            <div class="tw-relative tw-flex tw-items-center tw-px-6 tw-py-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search tw-absolute tw-start-10 tw-h-4 tw-w-4 tw-text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                <input type="text" v-model="chatSearchQuery" class="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus:tw-border-primary focus-visible:tw-outline-none disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-ps-10" placeholder="Chats search...">
            </div>
            <!-- tw-h-[calc(100vh_-_13rem)] -->
            <div class="tw-flex-grow @3xl/window:tw-h-[calc(100vh_-_15.8rem)] @3xl/window:tw-pt-4">
                <ScrollArea>
                    <div class="tw-block tw-min-w-0 tw-divide-y tw-border-y">
                        <ChatSidebarItem v-for="chat in filteredChats" :key="chat.id" :chat="chat" />
                    </div>
                </ScrollArea>
            </div>
        </div>
    </div>

    <Dialog
        v-model="newChatDialog"
        name="Create new chat"
    >
        <template #content>
            <div class="tw-relative tw-flex tw-items-center tw-px-6 tw-py-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search tw-absolute tw-start-10 tw-h-4 tw-w-4 tw-text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                <input type="text" v-model="advisorSearchQuery" class="tw-flex tw-h-10 tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium placeholder:tw-text-muted-foreground focus:tw-border-primary focus-visible:tw-outline-none disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-ps-10" placeholder="Search for Advisor...">
            </div>
            <ScrollArea v-if="advisors" class="tw-border tw-h-[50dvh] tw-rounded-md">
                <div v-for="advisor in filteredAdvisors" class="tw-group tw-relative tw-flex tw-min-w-0 tw-cursor-pointer tw-border-b tw-items-center tw-gap-4 tw-px-6 tw-py-4 hover:tw-bg-muted">
                    <span class="tw-relative tw-flex tw-shrink-0 tw-h-12 tw-w-12">
                        <img class="tw-aspect-square tw-overflow-hidden tw-rounded-full tw-h-full tw-w-full" alt="avatar image" :src="advisor.avatar" />
                        <div v-if="chatStore.usersOnline.find(id => id == advisor.id)" class="tw-w-3 tw-h-3 tw-absolute tw-rounded-full tw-end-0 tw-bottom-0 tw-bg-green-400"></div>
                    </span>
                    <div class="tw-min-w-0 tw-flex-grow">
                        <div class="tw-flex tw-justify-between">
                            <TruncatedText visibleClasses="tw-max-w-[196px] tw-font-semibold">
                                <span>{{advisor.full_name}}</span>
                            </TruncatedText>
                        </div>
                        <div class="tw-flex tw-items-center tw-gap-2">
                            <span class="tw-truncate tw-text-start tw-text-muted-foreground">{{ advisor.bio }}</span>
                        </div>
                    </div>
                    <i v-if="advisor.has_chat" class='tw-inline-flex tw-my-auto bx bx-user-check tw-text-3xl tw-pr-2 tw-text-primary' ></i>
                    <button v-else 
                        @click="chatStore.createChat(advisor.id)" 
                        class="tw-inline-flex tw-my-auto tw-items-center tw-justify-center tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-medium tw-ring-offset-background tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-border tw-border-input tw-bg-background hover:tw-bg-accent hover:tw-text-accent-foreground tw-h-10 tw-px-4 tw-py-2" 
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus tw-w-4 tw-h-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
                    </button>
                </div>
            </ScrollArea>
            <div v-else class="tw-flex tw-justify-center" >
                <i class='bx bx-loader-alt bx-spin tw-text-8xl tw-mx-auto tw-text-primary' ></i>
            </div>
        </template>

        <template #actions>
        </template>
    </Dialog>
</template>


<script>
import { ScrollArea } from '@/shadcn-vue-components/scroll-area';
import { useChatStore } from '@/stores/useChatStore';
import ChatSidebarItem from './ChatSidebarItem.vue';
import Dialog from '@/elements/Dialog.vue';
import TruncatedText from '@/elements/TruncatedText.vue';

export default {
    setup() {
        const chatStore = useChatStore();
        return { chatStore };
    },

    data() {
        return {
            advisors: null, 
            newChatDialog: false,
            chatSearchQuery: '',
            advisorSearchQuery: ''
        }
    },

    props: {

    },

    components: {
        ScrollArea,
        ChatSidebarItem,
        Dialog,
        TruncatedText
    },
    
    computed: {
        filteredChats() {
            if (!this.chatStore.chatsLoaded) return [];

            return this.chatStore.chats.filter(chat => 
                chat.user1.full_name.toLowerCase().includes(this.chatSearchQuery.toLowerCase()) || 
                chat.user2.full_name.toLowerCase().includes(this.chatSearchQuery.toLowerCase())
            );
        },

        filteredAdvisors() {
            if (!this.advisors) return [];

            return this.advisors.filter(advisor => 
                advisor.full_name.toLowerCase().includes(this.advisorSearchQuery.toLowerCase())
            );
        },
    },

    watch: {
        // On chat select or chat create (which auto selects), reset search queries and dialog state
        'chatStore.currentChat': function() {
            this.advisorSearchQuery = '';
            this.chatSearchQuery = '';
            this.newChatDialog = false;
        },
    },

    methods: {
        async newChat() {
            this.newChatDialog = true;
            
            await this.$axios.get("/otherChatters")
            .then(({ data }) => {
                this.advisors = data;
            })
        },
    }
};

</script>