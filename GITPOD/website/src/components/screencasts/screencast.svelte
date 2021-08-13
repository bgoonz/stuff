<script lang="ts">
  import type { Screencast } from "../../types/screencasts.type";
  import Preview from "./preview.svelte";

  export let screencast: Screencast;
  export let screencastNumber: number;

  $: screencastDurationMinutes = Math.floor(screencast.duration / 60);
  $: screencastDurationSeconds = screencast.duration % 60;
</script>

<style lang="scss">
  time {
    color: var(--light-grey);
  }
  article {
    max-width: 400px;
    min-width: 320px;
  }
  time,
  p {
    margin-left: 1rem;
  }
  time {
    font-size: var(--fine-print);
  }
</style>

<article>
  <Preview {screencast} {screencastNumber} />
  <time
    >Duration: {screencastDurationMinutes}m {screencastDurationSeconds}s</time
  >
  <p>{screencast.description}</p>
</article>
