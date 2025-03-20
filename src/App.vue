
<template>
    <header>
        <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    </header>
    <Button @click="user_id = 1">Login 1</Button>
    <Button @click="user_id = 2">Login 2</Button>

    <!-- <ChatCircle token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJmdWxsX25hbWUiOiJBbGljZSJ9.78WWU0ZM4-Xyi9YhFQaMQii0FDhRG6y7RaqjoboWp30" > </ChatCircle> -->
    <div v-if="user_id">
        <h1>Chat Circle</h1>
        <ChatCircle :userId="user_id"> </ChatCircle>
        <!-- <ChatWindow :userId="user_id" > </ChatWindow> -->
    </div>
    <div class="tw-h-[3000px] tw-w-2"></div>

</template>

<script>
import ChatCircle from './components/ChatCircle.vue';
import ChatWindow from './components/ChatWindow.vue';
import { Button } from './components/ui/shadcn-vue/button';

export default {
    name: 'App',
    components: {
        ChatCircle,
        ChatWindow, 
        Button
    },

    data() {
        return {
            user_id: null
        }
    },

    methods: {


    }
}
</script>


