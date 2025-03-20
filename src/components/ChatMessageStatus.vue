<template>
    <template v-if="isCurrentUser && message.status.status == 'unconfirmed'">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock tw-h-4 tw-w-4 tw-text-muted-foreground tw-ml-1">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
    </template>
    <template v-else-if="isCurrentUser && message.status.status == 'sent'">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check tw-size-4 tw-text-muted-foreground flex-shrink-0">
            <path d="M20 6 9 17l-5-5"></path>
        </svg>
    </template>
    <template v-else-if="isCurrentUser && message.status.status == 'read'">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-check tw-size-4 tw-flex-shrink-0 tw-text-[var(--primary)]">
            <path d="M18 6 7 17l-5-5"></path>
            <path d="m22 10-7.5 7.5L13 16"></path>
        </svg>
    </template>
</template>


<script>
import { useChatStore } from '@/stores/useChatStore';

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
};

</script>