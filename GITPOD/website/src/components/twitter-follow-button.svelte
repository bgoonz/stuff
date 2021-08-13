<script lang="ts">
  let clazz = "";
  export { clazz as class };
  export let trackingContext: string;
</script>

<a
  href="https://www.twitter.com/gitpod"
  rel="noopener"
  on:click={() =>
    window.analytics.track("social_opened", {
      context: trackingContext,
      platform: "twitter",
    })}
  target="_blank"
  class={clazz}>Follow us on Twitter</a
>
