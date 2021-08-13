<script>
  import { projects } from "../../../contents/home";
  import Project from "./project.svelte";
</script>

<style lang="scss">
  .projects {
    margin: var(--x-small) 0;
  }
</style>

<h3>Launch an example workspace</h3>
<p class="text-large">Dive into one of our example workspaces</p>
<div class="projects">
  {#each projects as project}
    <Project {project} />
  {/each}
</div>

<!-- <a href="#">More example workspaces ↗</a> -->
