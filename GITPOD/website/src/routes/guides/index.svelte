<script lang="ts" context="module">
  export const prerender = true;

  export async function load({ session }) {
    const guides = session.guides;
    return { props: { guides } };
  }
</script>

<script lang="ts">
  import OpenGraph from "../../components/open-graph.svelte";
  import PostPreview from "../../components/blog/post-preview.svelte";
  import Write from "./write.svelte";

  export let guides = [];
</script>

<style>
  header {
    @apply mb-huge !important;
  }
</style>

<OpenGraph
  data={{
    description: "Follow these guides to use Gitpod with any project",
    title: "Guides",
    norobots: true
  }}
/>

<header>
  <h1>Guides</h1>
  <p>Follow these guides to use Gitpod with any project</p>
</header>

<div
  class="grid justify-items-center grid-cols-1 md:grid-cols-2 max-w-4xl m-auto lg:max-w-full lg:grid-cols-1 gap-xx-small"
>
  {#each guides as guide}
    <PostPreview post={guide} type="guides" isMostRecent />
  {/each}
</div>

<Write />
