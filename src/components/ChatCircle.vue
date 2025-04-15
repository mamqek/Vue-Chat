<template>
    <!-- :active="!cartStore.isEmpty()" -->
    <v-fab
        size="x-large"
        color="var(--white-select)"
        icon=""
        @click="chatDialog = !chatDialog"
        class="pulse-effect tw-text-[var(--primary)] tw-pointer-events-auto tw-relative !tw-size-16"
        :class="{'widget-opened' : chatDialog}"
    >
        <i v-if="chatDialog" class='bx bx-x tw-text-5xl tw-text-black'></i>
        <i v-else class='bx bxs-conversation font-4 tw-text-black' :class="{'bx-tada' : chatStore.totalUnreadCount > 0}"></i>
        <span v-if="chatStore.totalUnreadCount > 0" 
            class="tw-rounded-full tw-size-6 tw-text-white tw-bg-primary tw-absolute -tw-top-1 -tw-left-1"
        >
            {{ chatStore.totalUnreadCount }}
        </span>
    </v-fab>
    <!-- <v-fab
        size="x-large"
        color="var(--white-select)"
        icon=""
        @click="chatDialog = !chatDialog"
        class="pulse-effect tw-text-[var(--primary)] tw-pointer-events-auto tw-relative !tw-size-16"
        :class="{'widget-opened' : chatDialog}"
    >
        <i v-if="chatDialog" class='bx bx-x tw-text-5xl tw-text-black'></i>
        <i v-else class='bx bxs-conversation font-4 tw-text-black' :class="{'bx-tada' : chatStore.totalUnreadCount > 0}"></i>
        <span v-if="chatStore.totalUnreadCount > 0" 
            class="tw-rounded-full tw-size-6 tw-text-white tw-bg-primary tw-absolute -tw-top-1 -tw-left-1"
        >
            {{ chatStore.totalUnreadCount }}
        </span>
    </v-fab> -->

    <v-dialog 
        v-model="chatDialog" 
        hide-overlay 
        z-index="15"
        :fullscreen="true"
        opacity="0" 
        :persistent="true"
        transition="dialog-bottom-transition" 
        id="chat_dialog" 
        scroll-strategy="none"
        class="" 
        content-class="min-sm:!tw-w-[500px] min-sm:!tw-h-[800px] tw-bottom-0 !tw-left-auto !tw-top-auto tw-bg-white min-sm:tw-right-16 min-sm:!tw-rounded-md"
    >
        <div class="min-sm:tw-hidden tw-flex tw-justify-center tw-items-center tw-z-20 tw-pt-2">
            <button
                class="tw-text-gray-500 tw-text-base tw-font-semibold tw-underline"
                @click="chatDialog = false"
            >
                Close
            </button>
        </div>
        <ChatWindow :userId="chatStore.user_id" :initStore="false"></ChatWindow>
    </v-dialog>

</template>

<script>
import { useChatStore } from '@/stores/useChatStore';
import ChatWindow from './ChatWindow.vue';


export default {
    name: "ChatCircle",

    setup() {
        const chatStore = useChatStore();
        return { chatStore };
    },

    mounted() {
        this.chatStore.auth(this.userId);        
    },

    props: {
        userId: {
            type: [String, Number],
            default: null,
        },
    },

    data() {
        return {
            chatDialog: false,
        };
    },

    components: {
        ChatWindow
    },

}
</script>

<style scoped>
    /* Allow interaction with the page behind chat dialog  */
    :deep(.v-overlay__scrim) {
        pointer-events: none !important;
    }
</style>
