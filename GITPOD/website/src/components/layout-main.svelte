<style>
  main {
    /* what does this do? */
    display: flex;
    flex-direction: column;
    flex: 1;
    flex-grow: 2;
    min-height: 50vh;
  }
</style>

<main>
  <slot />
</main>
