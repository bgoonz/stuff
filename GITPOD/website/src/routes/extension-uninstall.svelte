<script context="module">
  export const prerender = true;
</script>

<script lang="ts">
  import type { Form } from "../types/form.type";
  import OpenGraph from "../components/open-graph.svelte";

  const extensionUrls = {
    chrome:
      "https://chrome.google.com/webstore/detail/gitpod-dev-environments-i/dodmmooeoklaejobgleioelladacbeki",
    firefox: "https://addons.mozilla.org/en-GB/firefox/addon/gitpod/",
  };

  const currentBrowser =
    ["Chrome", "Firefox"].find(
      (browser) =>
        typeof window !== "undefined" &&
        window.navigator.userAgent.includes(browser)
    ) || "";

  const extensionUrl = extensionUrls[currentBrowser.toLowerCase()];

  const reasons = [
    { id: "usage", label: "I never used it" },
    { id: "configuring", label: "I have problems configuring my projects" },
    { id: "local", label: "I prefer my local development" },
    { id: "expected", label: "Gitpod isn’t what I expected" },
  ];

  const formData: Form = {
    reason: {
      el: null,
      valid: false,
      selected: [],
    },
    otherFeedback: {
      el: null,
      valid: true,
      value: "",
    },
  };
  let isFormDirty = false;
  let isFeedbackSent = false;

  $: isFormValid = Object.values(formData).every((field) => field.valid);

  const handleSubmit = async () => {
    isFormDirty = true;
    if (!isFormValid) {
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/feedback", {
        method: "post",
        body: JSON.stringify({
          type: "browser-extension",
          browser: currentBrowser,
          feedback: formData.reason.selected.reduce(
            (result, reason) =>
              `${reasons.find(({ id }) => id === reason).label}\n${result}`,
            ``
          ),
          note: formData.otherFeedback.value,
        }),
      });

      if (response.status === 201) {
        isFeedbackSent = true;
      } else {
        console.error(response.statusText);
      }
    } catch (error) {
      console.error(error);
    }
  };
</script>

<style type="text/postcss">
  header {
    @apply mb-0 !important;
  }

  form li {
    @apply mb-0;
  }
</style>

<OpenGraph
  data={{
    description: "The browser extension has been uninstalled.",
    title: "Extension Uninstall",
    norobots: true,
  }}
/>

<header>
  {#if extensionUrl}
    <a href={extensionUrl} rel="noopener" target="_blank">Reinstall Extension</a
    >
  {/if}
  <h1>How Can We Improve?</h1>
</header>
<section
  class="card card shadow-xl mb-32 sm:mx-8 lg:flex lg:items-center lg:justify-around"
>
  <div class="letter lg:w-2/5 lgpr-xx-small mb-small">
    <p class="text-large">
      Hi there, sad to hear that our browser extension was uninstalled. To
      improve and make sure that other developers are happier with Gitpod, we’d
      love to get your opinion on why you decided to uninstall your browser
      extension. ✌️
    </p>
    <br />
    <p class="text-large">
      ps. Did you know we also offer a <a href="/docs/browser-bookmarklet"
        >browser bookmarketlet</a
      > as an alternative?
    </p>
  </div>
  <form
    on:submit|preventDefault={handleSubmit}
    name="Extension Deletion"
    novalidate
    class="lg:w-2/5"
  >
    <input type="hidden" name="form-name" value="extension-deletion" />
    <h2 class="h3">Why did you uninstall the browser extension?</h2>
    <ul>
      <li class:error={isFormDirty && !formData.reason.valid}>
        <fieldset>
          <legend>Check all that apply:</legend>
          <ul class="my-macro">
            {#each reasons as { id, label }}
              <li>
                <input
                  type="checkbox"
                  name="reason"
                  value={id}
                  {id}
                  data-text={label}
                  bind:group={formData.reason.selected}
                  bind:this={formData.reason.el}
                  on:change={() => {
                    formData.reason.valid =
                      formData.reason.selected.length > 0 &&
                      formData.reason.el.validity.valid;
                  }}
                />
                <label for={id}>{label}</label>
              </li>
            {/each}
          </ul>
        </fieldset>
      </li>
      <li class:error={isFormDirty && !formData.otherFeedback.valid}>
        <textarea
          aria-label="Do you have any other feedback?"
          placeholder="Do you have any other feedback?"
          id="otherFeedback"
          name="otherFeedback"
          bind:value={formData.otherFeedback.value}
          bind:this={formData.otherFeedback.el}
          cols="20"
          rows="4"
          on:change={() => {
            formData.otherFeedback.valid =
              formData.otherFeedback.value === ""
                ? true
                : formData.otherFeedback.el.validity.valid;
          }}
        />
      </li>
      <li>
        <button
          class="btn-cta mt-x-small"
          disabled={(isFormDirty && !isFormValid) || isFeedbackSent}
          type="submit">Send</button
        >
      </li>
    </ul>
    {#if isFeedbackSent}
      <p>Thanks for your Feedback</p>
    {/if}
  </form>
</section>
