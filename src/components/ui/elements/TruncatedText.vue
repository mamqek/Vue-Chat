<template>
  <TooltipProvider>
    <Tooltip class="tw-flex">
      <TooltipTrigger :asChild="true">
        <div
          ref="trigger"
          :class="['tw-inline-block tw-truncate tw-text-ellipsis tw-whitespace-nowrap tw-align-middle', visibleClasses, textClasses]"
          @click="handleClick"
        >
          <slot />
        </div>
      </TooltipTrigger>

      <!-- Tooltip content: full text -->
      <TooltipContent side="bottom">
        <p :class="[textClasses]"><slot /></p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script>
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shadcn-vue-components/tooltip';

export default {
  name: 'TruncatedText',
  components: {
    TooltipProvider,
    Tooltip,
    TooltipContent,
    TooltipTrigger
  },
  props: {
    visibleClasses: {
      type: String,
      default: 'tw-max-w-[200px]'
    },
    textClasses: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleClick(event) {
        // Check for touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            event.preventDefault();

            // Simulate triggering the tooltip
            const tooltipTriggerElement = this.$refs.trigger;
            if (tooltipTriggerElement) {
                tooltipTriggerElement.dispatchEvent(new Event('mouseover', { bubbles: true }));
            }
        }
    }
}
};
</script>
