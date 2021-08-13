<script>
  import Feature from "./feature.svelte";

  export let features = [];
</script>

{#each features as feature}
  <Feature {feature} />
{/each}
