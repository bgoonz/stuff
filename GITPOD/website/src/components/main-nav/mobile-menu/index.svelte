<script lang="ts">
import { onMount } from "svelte";
import { showHideOverflowY } from "../../../utils/helper";

  import LoginButton from "../login-button.svelte";
  import NavItem from "../nav-item.svelte";
  import menuState from "./state";

  export let navItems = [];

  onMount(() => {
    const handleTabletChange = (e) => {
      if(e.matches) {
        $menuState = false
        showHideOverflowY(false);
      }
    }
    let query = window.matchMedia("(min-width: 931px)")
    query.addEventListener('change',handleTabletChange);
  })
</script>

<style type="text/postcss">
  /* Always make sure to keep the media query intact with one specified above in the matchMedia call. */
  @media (min-width: 931px) {
    .nav-items {
      @apply hidden;
    }
  }
</style>

{#if $menuState}
  <div
    class="nav-items absolute flex flex-col pt-10 pb-16 w-screen items-center bg-off-white space-y-xx-small z-10 shadow-md"
  >
    {#each navItems as navItem}
      <NavItem
        {navItem}
        on:click={() => {
          $menuState = !$menuState;
          showHideOverflowY(false);
        }}
      />
    {/each}
    <LoginButton />
  </div>
{/if}
