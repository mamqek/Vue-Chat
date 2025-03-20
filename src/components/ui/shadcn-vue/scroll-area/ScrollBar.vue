<script setup>
import { cn } from '@/lib/utils';
import { ScrollAreaScrollbar, ScrollAreaThumb } from 'reka-ui';
import { computed } from 'vue';

const props = defineProps({
  orientation: { type: String, required: false, default: 'vertical' },
  forceMount: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <ScrollAreaScrollbar
    v-bind="delegatedProps"
    :class="
      cn(
        'tw-flex tw-touch-none tw-select-none tw-transition-colors',
        orientation === 'vertical' &&
          'tw-h-full tw-w-2.5 tw-border-l tw-border-l-transparent tw-p-px',
        orientation === 'horizontal' &&
          'tw-h-2.5 tw-flex-col tw-border-t tw-border-t-transparent tw-p-px',
        props.class,
      )
    "
  >
    <ScrollAreaThumb class="tw-relative tw-flex-1 tw-rounded-full tw-bg-border" />
  </ScrollAreaScrollbar>
</template>
