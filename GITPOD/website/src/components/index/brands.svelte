<script>
  import { brands } from "../../contents/home";
  import Brand from "./brand.svelte";
</script>

<style lang="scss">
  .brands {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    max-width: 1140px;
    margin: 0 auto;
    padding-top: var(--large);

    @media (max-width: 840px) {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }
  }
</style>

<div class="brands">
  {#each brands as brand}
    <Brand {brand} />
  {/each}
</div>
