<template>
    <div class="tw-shadow-base tw-rounded-lg tw-border tw-bg-card tw-text-card-foreground">
        <div class="tw-relative tw-flex tw-items-end tw-gap-2 tw-justify-between tw-p-2">
            <textarea 
                v-model="newMessageText"
                class="hide-scrollbar tw-max-h-96 tw-flex-grow tw-flex tw-break-words tw-whitespace-normal tw-rounded-md tw-border tw-bg-background tw-px-3 tw-py-2 tw-text-sm file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium focus:tw-border-primary focus-visible:tw-outline-none disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-border-transparent  !tw-text-base !tw-shadow-transparent !tw-ring-transparent tw-resize-none tw-overflow-auto tw-min-h-10 tw-placeholder"
                placeholder="Enter message..."
                rows="1"
                ref="messageInput"
                @keydown="handleKeydown"
                @input="autoResize"
            ></textarea>
            <!-- <div 
                contenteditable="true"
                class=" tw-flex-grow tw-flex tw-break-words tw-whitespace-normal tw-rounded-md tw-border tw-bg-background tw-px-3 tw-py-2 tw-text-sm file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium focus:tw-border-primary focus-visible:tw-outline-none disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-border-transparent  !tw-text-base !tw-shadow-transparent !tw-ring-transparent tw-resize-none tw-overflow-auto tw-min-h-10 tw-placeholder"
                placeholder="Enter message..."
                ref="messageInput"
                @input="handleDivInput"
                :text-content.prop="newMessageText"
            ></div> -->
            <div class="tw-flex tw-items-center tw-gap-2">
                <!-- <div class="tw-block min-lg:tw-hidden">
                    <Popover>
                        <PopoverTrigger as-child>
                            <button class="tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-text-sm tw-font-medium tw-ring-offset-background tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50 hover:tw-bg-accent hover:tw-text-accent-foreground tw-h-11 tw-w-11 tw-rounded-full tw-p-0" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus tw-h-4 tw-w-4">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <path d="M8 12h8"></path>
                                    <path d="M12 8v8"></path>
                                </svg>
                            </button>
                        </PopoverTrigger>

                        <PopoverContent class=" tw-w-36 tw-h-9 tw-bg-black">
                            Here
                        </PopoverContent>
                    </Popover>
                    tw-hidden min-lg:tw-block
                </div> -->
                <div>
                    <!-- <button class="tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-text-sm tw-font-medium tw-ring-offset-background tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50 hover:tw-bg-accent hover:tw-text-accent-foreground tw-h-11 tw-w-11 tw-rounded-full tw-p-0" data-state="closed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile tw-h-4 tw-w-4">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" x2="9.01" y1="9" y2="9"></line>
                            <line x1="15" x2="15.01" y1="9" y2="9"></line>
                        </svg>
                    </button> -->
                    <Button 
                        variant="ghost"
                        @click="triggerFileInput" 
                        class="!tw-h-11 !tw-w-11 !tw-rounded-full !tw-p-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip tw-h-4 tw-w-4">
                            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                        <input type="file" id="fileInput" multiple class="tw-hidden" @change="handleFileUpload">
                    </Button>
                    <!-- <button class="tw-inline-flex tw-items-center tw-justify-center tw-whitespace-nowrap tw-text-sm tw-font-medium tw-ring-offset-background tw-transition-colors focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-pointer-events-none disabled:tw-opacity-50 hover:tw-bg-accent hover:tw-text-accent-foreground tw-h-11 tw-w-11 tw-rounded-full tw-p-0" data-state="closed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic tw-h-4 tw-w-4">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" x2="12" y1="19" y2="22"></line>
                        </svg>
                    </button> -->
                </div>
                <Button @click="sendMessage" class="!tw-h-10" :disabled="newMessageText.trim() === ''" >Send</Button>
            </div>
        </div>
    </div>

    <Dialog
        v-model="dialogOpen"
        name="Send File"
    >
        <template #content>
            <v-card-text>

                <div class="tw-flex tw-flex-wrap tw-gap-2">
                    <div class="tw-min-w-28 tw-flex-1 tw-relative tw-my-auto" v-for="attachment in attachments" :key="attachment.file.name">
                        <button @click="attachments.splice(attachments.indexOf(attachment), 1)" class="tw-absolute tw-top-0 tw-end-0 tw-m-1 tw-p-1 tw-rounded-full tw-bg-card tw-text-card-foreground tw-opacity-80 hover:tw-opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x tw-h-4 tw-w-4">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <img v-if="attachment.preview.startsWith('data:image')" :src="attachment.preview" alt="Attachment Preview" class="tw-w-full tw-h-auto tw-rounded-md" />
                        <div v-else class="tw-flex tw-flex-col tw-justify-center tw-items-center tw-border tw-rounded-md tw-p-4 tw-text-muted-foreground tw-aspect-square">
                            <i v-if="attachment.preview.endsWith('pdf')" class='bx bxs-file-pdf tw-text-5xl'></i>
                            <i v-else class='bx bxs-file-doc tw-text-5xl'></i>
                            <p class="tw-text-center tw-break-all">{{ attachment.file.name }}</p>
                        </div>
                    </div>
                </div>
            </v-card-text>
        </template>

        <template #actions>
            <div class="tw-w-full tw-mt-4 tw-flex tw-gap-2 tw-justify-between tw-items-center tw-p-2 tw-rounded-lg tw-border tw-bg-card tw-text-card-foreground">                
                <Button variant="outline" class="!tw-h-10" @click="triggerFileInput" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus tw-w-4 tw-h-4"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>
                </Button>
                <textarea 
                    v-model="newMessageText"
                    class="hide-scrollbar tw-max-h-96 tw-flex-grow tw-flex tw-break-words tw-whitespace-normal tw-rounded-md tw-border tw-bg-background tw-px-3 tw-py-2 tw-text-sm file:tw-border-0 file:tw-bg-transparent file:tw-text-sm file:tw-font-medium focus:tw-border-primary focus-visible:tw-outline-none disabled:tw-cursor-not-allowed disabled:tw-opacity-50 tw-border-transparent  !tw-text-base !tw-shadow-transparent !tw-ring-transparent tw-resize-none tw-overflow-auto tw-min-h-10 tw-placeholder"
                    placeholder="Add a caption..."
                    rows="1"
                    ref="messageInput"
                    @keydown="handleKeydown"
                    @input="autoResize"
                ></textarea>
                <Button @click="sendMessage" class="!tw-h-10" :disabled="attachments.length == 0">Send</Button>
            </div>
        </template>
    </Dialog>

</template>

<script>
import Dialog from '@/elements/Dialog.vue';
import { Button } from '@/shadcn-vue-components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn-vue-components/popover';
import { useChatStore } from '@/stores/useChatStore';


export default {
    setup() {
        const chatStore = useChatStore();
        return { chatStore };
    },

    data() {
        return {
            dialogOpen: false,
            newMessageText: "",
            attachments: [],
            error: null,
        };
    },

    watch: {
        error(value) {
            if (value) {
                $.toast({
                    heading: value.title,
                    text: value.message,
                    hideAfter: 10000,
                    position: 'bottom-center',
                    class: "error"
                });
                this.error = null;
            }
        }
    },

    props: {

    },

    components: {
        // Popover, 
        // PopoverTrigger,
        // PopoverContent
        Dialog,
        Button
    },
    
    methods: {
        handleKeydown(event) {
            // Check if Enter key is pressed
            if (event.key === "Enter") {
                // If Shift key is held, allow new line
                if (event.shiftKey) {
                    return; // Allow a new line
                }
                // If Shift is not held, send the message
                this.sendMessage();
                event.preventDefault(); // Prevent form submission or default behavior of Enter key
            }
        },

        triggerFileInput() {
            if (this.attachments.length > 0 && !this.dialogOpen) {
                this.dialogOpen = true;
                return;
            }
            document.getElementById('fileInput').click();
        },

        async handleFileUpload(event) {
            const getFilePreview = async (file) => {
                return new Promise((resolve, reject) => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const preview = e.target.result; // Store the preview URL
                            resolve(preview);
                        };
                        reader.onerror = (err) => reject(err);
                        reader.readAsDataURL(file); // Read the file as a data URL for preview
                    } else {
                        // For non-image files, resolve with null as preview
                        resolve(file.type);
                    }
                });
            };

            for (var i = 0; i < event.target.files.length; i++) {
                let file = event.target.files[i];

                if (file.size > 30000000) {
                    this.error = {
                        title: "Invalid file - " + file.name,
                        message: 'File size should be less than 30MB',
                    } 
                    continue;
                }

                // Check MIME type for documents and images
                const allowedMimeTypes = [
                    'application/pdf', // PDF
                    'application/msword', // DOC
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
                    'image/jpeg', // JPEG images
                    'image/png', // PNG images
                    'image/gif', // GIF images
                    'image/webp' // WebP images
                ];
                
                if (!allowedMimeTypes.includes(file.type)) {
                    this.error = {
                        title: "Invalid file type - " + file.name,
                        message: 'Only PDF, DOC, DOCX, and image files (JPEG, PNG, GIF, WebP) are allowed',
                    };
                    continue;
                }

                // Wait for the preview to finish before pushing it to attachments
                const attachmentPreview = await getFilePreview(file);

                this.attachments.push({
                    file: event.target.files[i],
                    preview: attachmentPreview,
                });
            }

            if (this.attachments.length > 0) this.dialogOpen = true;
        },

        // TODO: show message right away, then replace by response from server
        async sendMessage() {
            if (!this.newMessageText.trim() && this.attachments.length === 0) {
                this.error = {
                    title: "Invalid submission",
                    message: 'Enter a message or attach a file to send a message',
                } 
                return;
            }

            // Preserve new line characters
            let text = this.newMessageText.replace(/\n/g, "\n"); 

            // Clear the input field and resize it back to 1 row
            this.newMessageText = "";
            this.$nextTick(() => {
                this.autoResize({ target: this.$refs.messageInput });
            });
            console.log('receiver_id', this.chatStore.currentReceiver.id)

            if (this.attachments.length == 0) {
                await this.$axios.post("/sendMessage", {
                    receiver_id: this.chatStore.currentReceiver.id,
                    text: text,
                }).then(({ data }) => {
                    let message = data; 
                    this.chatStore.messageSentConfirmed(message);
                })
            } else {
                this.dialogOpen = false;

                const formData = new FormData();
                formData.append('receiver_id', this.chatStore.currentReceiver.id);
                formData.append('text', text);
                for (var i = 0; i < this.attachments.length; i++) {
                    formData.append('attachment[]', this.attachments[i].file);
                }
                this.attachments = [];

                await this.$axios.post("/sendMessage", formData)
                .then(({ data }) => {
                    let message = data; 
                    this.chatStore.messageSentConfirmed(message);
                })
            }
        },

        autoResize(event) {
            const element = event.target;
            element.style.height = 'auto';
            if (this.newMessageText == "") return;
            element.style.height = `${element.scrollHeight}px`;
        }

    },
};

</script>