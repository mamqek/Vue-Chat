<template>
    <div class="tw-max-w-80 @lg/chat:tw-max-w-[448px] @3xl/chat:tw-max-w-[640px] tw-w-full" :class="{ 'tw-self-end': isCurrentUser }">
        <div class="tw-flex tw-items-center tw-gap-2 tw-max-w-full tw-w-full" :class="{ 'tw-justify-end': isCurrentUser }">
            <div class="message-bubble tw-shadow-base tw-rounded-lg tw-border tw-bg-card tw-text-card-foreground tw-max-w-[calc(100%-72px)] tw-break-words tw-whitespace-pre-wrap tw-py-2 tw-px-3 @lg/chat:tw-px-4"
                :class="{ 'tw-order-1': isCurrentUser }"
            >
                <button 
                    v-if="message.attachment"
                    class="tw-w-fit tw-p-0 tw-h-auto hover:tw-bg-transparent tw-my-2"
                    id="watch_attachments"
                    @click="$emit('open-attachment', this.message.attachment)"
                >
                    <div class="tw-flex tw-flex-wrap tw-gap-1 @lg/chat:tw-gap-2 tw-items-center">
                        <div 
                            v-for="(attachment, index) in message.attachment.slice(0, 4)" 
                            :key="attachment.url"
                            :class="[
                                'tw-flex-1 tw-relative',
                                'tw-min-w-24 tw-max-w-36',
                                '@lg/chat:tw-min-w-40 @lg/chat:tw-max-w-52',
                                '@3xl/chat:tw-min-w-52 @3xl/chat:tw-max-w-80'
                            ]"
                        >
                            <img v-if="attachment.type.startsWith('image')" @load="$emit('loaded')" :src="attachment.url" :alt="attachment.name" class="tw-w-full tw-h-auto tw-rounded-md" />
                            <div v-else class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-border tw-rounded-md tw-p-4 tw-text-muted-foreground tw-aspect-square">
                                <i v-if="attachment.type.endsWith('pdf')" class='bx bxs-file-pdf tw-text-5xl'></i>
                                <i v-else class='bx bxs-file-doc tw-text-5xl'></i>
                                <p class="tw-text-center tw-break-all tw-text-xs @lg/chat:tw-text-base">{{ attachment.name }}</p>
                            </div>
                            <div v-if="index == 3 && message.attachment.length > 4" class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-rounded-md tw-bg-black/60 tw-text-primary tw-text-3xl @lg/chat:tw-text-[40px] @3xl/chat:tw-text-5xl tw-font-bold">+{{ message.attachment.length - 3 }}</div>
                        </div>
                    </div>
                </button>
                <p :class="{ 'tw-text-right': isCurrentUser }">{{ message.text }} </p>     
            </div>
            <div :class="{ 'tw-order-2': !isCurrentUser }">
                <button class="tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-rounded-md tw-text-sm tw-font-medium tw-ring-offset-background tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50 hover:tw-bg-accent hover:tw-text-accent-foreground tw-h-10 tw-px-4 tw-py-2" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis tw-h-4 tw-w-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                </button>
            </div>
        </div>
        <div class="tw-flex tw-items-center tw-gap-2" :class="{ 'tw-justify-end': isCurrentUser }">
            <time class="tw-mt-1 tw-flex tw-items-center tw-text-sm tw-text-muted-foreground">{{ formatDateTime(message.updated_at).short }}</time>
            <ChatMessageStatus :message="message"/>
        </div>
    </div>
</template>

<script>
import { useChatStore } from '@/stores/useChatStore';
import { formatDateTime } from '@/helpers';
import ChatMessageStatus from './ChatMessageStatus.vue';


export default {
    setup() {
        const chatStore = useChatStore();
        return { chatStore };
    },

    props: {
        message: {
            type: Object,
            required: true,
        },
    },
    
    computed: {
        isCurrentUser() {
            return this.chatStore.user_id == this.message.sender_id;
        }
    },

    components: {
        ChatMessageStatus
    },

    methods: {
        formatDateTime,
    },
 };

</script>

<style scoped>

/* .message-bubble {
    position: relative;

    &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: -8px;
        width: 0;
        height: 0;
        height: 16px;
        width: 16px;
        background-color: black;
        border-top: 8px solid transparent;
        border-left: 8px solid transparent;
        border-bottom: 8px solid black;
        border-right: 8px solid black;
    }
} */

</style>