<script lang="ts">
  import RecentArticlesPreview from "./recent-articles-preview.svelte";
  import NewsletterSignup from "./newsletter-signup.svelte";
  import PostContentLayout from "../post-content-layout.svelte";
  import FeedbackWidget from "../docs/feedback-widget.svelte";
  import DigestHeader from "./digest-header.svelte";
  const { type } = $$restProps;
</script>

{#if type === "digest"}
  <DigestHeader />
{/if}

<PostContentLayout
  imagesDirectoryName="blog"
  baseUrl="https://www.gitpod.io/blog/"
  {...$$restProps}
>
  <slot />
</PostContentLayout>

{#if type === "digest"}
  <FeedbackWidget class="mt-large mb-huge" type="digests" />
{:else}
  <NewsletterSignup class="mx-auto mt-large mb-huge" />
{/if}
<RecentArticlesPreview />
