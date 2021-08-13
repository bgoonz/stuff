<script>
  import { onMount } from "svelte";

  let counter = 0;

  setInterval(() => counter++, 1000);
</script>

<span>{counter}</span>
{counter === 1 ? "second" : "seconds"}
