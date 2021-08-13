<script>
  import Banner from "./base.svelte";
</script>

<Banner location="bottom" storageKey="cookie-consent" let:closeBanner>
  <p class="w-7/12 md:w-9/12">
    This website uses cookies to enhance the user experience. Read our <a
      href="/privacy">privacy policy</a
    > for more info.
  </p>
  <button
    on:click={closeBanner}
    class="px-3 py-1 bg-off-white rounded-lg md:px-6 hover:bg-white"
    >Accept Cookies</button
  >
</Banner>
