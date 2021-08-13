<script lang="ts">
  import { showHideOverflowY } from "../utils/helper";

  import { createEventDispatcher } from "svelte";

  export let isOpen = false;

  $: {
    if (typeof document !== "undefined") {
      if (isOpen) {
        showHideOverflowY(true);
      } else {
        showHideOverflowY(false);
      }
    }
  }

  const dispatch = createEventDispatcher();

  let closeEl: HTMLButtonElement;
  let focusedEl: HTMLElement;

  $: if (isOpen) {
    if (typeof document !== "undefined")
      focusedEl = <HTMLElement>document.activeElement;
    closeEl && closeEl.focus();
  }

  const closeModal = () => {
    dispatch("close");
    focusedEl && focusedEl.focus();
    focusedEl = null;
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal();
    }
  };
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal flex justify-center items-center" on:click={closeModal}>
    <div class="flex justify-center items-center relative">
      <button
        class="absolute right-6 top-6 h-3 w-3 z-10"
        bind:this={closeEl}
        aria-label="close this popup"
        on:click={closeModal}
      >
        <img alt="Close" role="presentation" src="/x.svg" />
      </button>
      <slot />
    </div>
  </div>
{/if}
