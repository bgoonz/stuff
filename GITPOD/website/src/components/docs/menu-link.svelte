<script lang="ts">
  import { page } from "$app/stores";

  export let href: string;

  $: normalizedPath = /self-hosted\/\d\.\d\.\d/.test($page.path)
    ? $page.path.replace(/\d\.\d\.\d/, "latest")
    : $page.path;
  $: active = href === normalizedPath || href === `${normalizedPath}/`;
</script>

<style>
  .active {
    color: var(--black);
  }
</style>

<a class:active {href} sveltekit:prefetch {...$$props}><slot /></a>
