<script lang="ts">
  export let iterations: number | "infinite" = 1;
  export let center = false;
</script>

<style>
  @keyframes draw {
    from {
      stroke-dashoffset: 191.8;
    }

    to {
      stroke-dashoffset: 0;
    }
  }

  svg {
    width: 100px;
    height: auto;
    margin-bottom: var(--medium);
  }

  svg.center {
    margin-left: auto;
    margin-right: auto;
  }

  path {
    stroke-dasharray: 191.8 191.8;
    animation-delay: 0s;
    animation-duration: 1.5s;
    animation-iteration-count: var(--iterations, 1);
    animation-name: draw;
    animation-direction: alternate;
    animation-play-state: running;
    animation-timing-function: ease-in-out;
  }
</style>

<svg
  class:center
  style="--iterations: {iterations};"
  xmlns="http://www.w3.org/2000/svg"
  width="75.78"
  height="82.55"
  viewBox="0 0 75.78 82.55"
>
  <defs>
    <linearGradient
      id="gitpod-logo-animation-paint"
      x1="17"
      y1="76"
      x2="32"
      y2="36"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#FB8700" />
      <stop offset="1" stop-color="#FBB000" />
    </linearGradient>
  </defs>
  <path
    d="M 37.89 42.29 L 62.39 28.51 A 3 3 0 0 1 65.39 28.51 A 3.05 3.05 0 0 1 66.89 31.12 L 66.89 53.56 A 9 9 0 0 1 62.339999999999996 61.38 C 62.339999999999996 61.38 46.97 70.09 42.339999999999996 72.76 A 9.09 9.09 0 0 1 33.44 72.76 L 13.440000000000001 61.38 A 8.86 8.86 0 0 1 8.89 53.56 L 8.89 31 A 9.07 9.07 0 0 1 13.44 23.2 L 38.33 9 L 38.33 9"
    fill="none"
    stroke="url(#gitpod-logo-animation-paint)"
    stroke-miterlimit="10"
    stroke-width="15.5"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
</svg>
