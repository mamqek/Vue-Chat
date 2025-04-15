<template>
    <div @click="chatStore.setCurrentChatId(chat.id)" 
        class="tw-group tw-relative tw-flex tw-min-w-0 tw-cursor-pointer tw-items-center tw-gap-4 tw-px-6 tw-py-4 hover:tw-bg-muted"
        :class="{ 'tw-bg-muted': chatStore.currentChatId == chat.id }"
    >
        <span class="tw-relative tw-flex tw-shrink-0 tw-h-12 tw-w-12">
            <img class="tw-aspect-square tw-overflow-hidden tw-rounded-full tw-h-full tw-w-full" alt="avatar image" :src="opponent.avatar" />
            <div v-if="chatStore.usersOnline.find(id => id == opponent.id)" class="tw-w-3 tw-h-3 tw-absolute tw-rounded-full tw-end-0 tw-bottom-0 tw-bg-green-400"></div>
        </span>
        <div class="tw-min-w-0 tw-flex-grow">
            <div class="tw-flex tw-justify-between">
                <TruncatedText visibleClasses="tw-max-w-[196px] tw-font-semibold">
                    <span>{{opponent.full_name}}</span>
                </TruncatedText>
                <span v-if="chat.last_message" class="tw-text-sm tw-text-muted-foreground">{{formatDateTimePassed(chat.last_message.updated_at)}}</span>
            </div>
            <div v-if="chat.last_message" class="tw-flex tw-items-center tw-gap-2">
                <ChatMessageStatus :message="chat.last_message" />
                <span class="tw-truncate tw-text-start tw-text-muted-foreground">{{ chat.last_message.attachment ? `Attachment(${chat.last_message.attachment.length}) ` : '' }}{{ chat.last_message.text }}</span>
                <div v-if="chat[myChatAttrName + '_unread_count'] != 0" class="tw-ms-auto tw-flex tw-h-6 tw-w-6 tw-flex-shrink-0 tw-items-center tw-justify-center tw-rounded-full tw-bg-[var(--primary)] tw-text-sm tw-text-white">{{ chat[myChatAttrName + '_unread_count'] }}</div>
            </div>
        </div>
        <div class="tw-absolute tw-bottom-0 tw-end-0 tw-top-0 tw-flex tw-items-center tw-bg-gradient-to-l tw-from-50% tw-px-4 tw-opacity-0 group-hover:tw-opacity-100 tw-from-gray-200 dark:tw-from-muted">
            <button class="tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-text-sm tw-font-medium tw-ring-offset-background tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50 tw-border tw-border-input tw-bg-background hover:tw-bg-accent hover:tw-text-accent-foreground tw-h-10 tw-w-10 tw-rounded-full tw-p-0" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis tw-h-4 tw-w-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
        </div>
    </div>
</template>

<script>
import TruncatedText from '@/elements/TruncatedText.vue';
import { useChatStore } from '@/stores/useChatStore';
import { formatDateTimePassed } from '@/helpers';
import ChatMessageStatus from './ChatMessageStatus.vue';


export default {
    setup() {
        const chatStore = useChatStore();
        return { chatStore };
    },

    props: {
        chat: {
            type: Object,
            required: true,
        },
    },

    components: {
        TruncatedText,
        ChatMessageStatus
    },
    
    computed: {
        opponent() {
            console.log('chat', this.chat)
            return this.chat.user1.id == this.chatStore.user_id ? this.chat.user2 : this.chat.user1;
        },
        myChatAttrName() {
            return this.chat.user1.id == this.chatStore.user_id ? 'user1' : 'user2';
        }
    },

    methods: {
        formatDateTimePassed,
    },
};

</script>