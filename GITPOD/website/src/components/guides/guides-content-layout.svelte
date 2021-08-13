<script>
  import FeedbackWidget from "../docs/feedback-widget.svelte";
  import PostContentLayout from "../post-content-layout.svelte";
</script>

<PostContentLayout
  imagesDirectoryName="guides"
  baseUrl="https://www.gitpod.io/guides/"
  norobots={true}
  {...$$restProps}
>
  <slot />
</PostContentLayout>
<FeedbackWidget type="guides" class="mb-huge" />
