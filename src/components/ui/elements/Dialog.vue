<template>
	<v-dialog
		v-model="dialog"
        z-index="30"
		:max-width="maxWidth"
		:activator="activatorId"
		data-lenis-prevent
		v-bind="builtinProps"
	>
		<!--activatorId must be with # -->


		<template #activator="{ props: activatorProps }">
			<!-- <v-btn
                v-bind="activatorProps"
                class="btn"
                :text="name"
            ></v-btn> -->
			<slot name="activator" />
		</template>

		<template #default="{ isActive }">
			<!-- Can be used with v-card as a wrapper for content or without -->
			<template v-if="$slots.content">
				<!-- Render v-card only if #content slot exists -->
				<v-card
					:title="name"
					:class="['rounded-modal', cardClasses]"
				>
                    <div class="!tw-px-4">
                        <slot name="content" />
                    </div>

					<v-card-actions v-if="$slots.actions || isForm" class="!tw-p-4">
						<slot name="actions" />
						<template v-if="isForm">
                            <template v-if="!submitted">

                                <Button
                                    @click="isActive.value = false"
                                >
                                    Cancel
                                </Button>

                                <v-spacer />

                                <Button
                                    @click="$emit('dialog-submit', state);"

                                >
                                    Confirm
                                </Button>
                            </template>
                            <template v-else>
                                <v-spacer />

                                <Button
                                >
                                    Sending
                                    <i class='bx bx-loader-alt tw-animate-spin tw-font-medium tw-ml-2' ></i>
                                </Button>
                            </template>

						</template>
					</v-card-actions>
					<div
						v-else
						class=" tw-h-8"
					/>
				</v-card>
			</template>
			<template v-else>
				<slot />
			</template>
		</template>
	</v-dialog>
</template>
                <!-- <Button :id="`open_${video.id}`">
                    View
                </Button> -->

<!-- prepend-icon="mdi-plus"
:variant="toolbar ? 'flat' : 'outlined'"
:class="toolbar ? '' : 'outside'"
:color="toolbar ? '#2d862b' : '#ffffff'" -->

<script>
import { Button } from '@/shadcn-vue-components/button';

export default {
	name: "Dialog",

    components: {
        Button,
    },

	props: {
		name: {
			type: String,
			default: ""
		},
		activatorId : {
			type: String,
			default: "#activator"
		},
		isForm: {
			type: Boolean,
			default: false
		},
		maxWidth: {
			type: String,
			default: "500"
		},
		builtinProps: {
			type: Object,
			default: () => ({}),
		},
		cardClasses: {
			type: [String, Array, Object],
			default: () => ""
		},
        submitted: {
            type: Boolean,
            default: false,
        },
	},


	data() {
		return {
			dialog: false,
		}
	},

	methods: {
		validateForm() {
			return this.$refs.form.validate();
		},
	}
}
</script>

<style scoped>
form {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.outside {
    height: 3.5rem;
}


</style>