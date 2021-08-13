<script lang="ts">
  import Avatars from "./avatars.svelte";
  import OpenGraph from "./open-graph.svelte";
  import { authors, authorSocialMediaLinks } from "../contents/authors";
  import "../assets/markdown-commons.scss";

  export let baseUrl: string;
  export let imagesDirectoryName: string;
  export let norobots: boolean = false;

  const {
    date,
    author,
    slug,
    title,
    image,
    teaserImage,
    excerpt,
  } = $$restProps;

  let dateDisplay = new Date(Date.parse(date)).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const authorDisplayNames = Object.entries(authors).reduce(
    (displayNames, [username, profile]) => {
      displayNames[username] = profile.name;
      return displayNames;
    },
    {}
  );

  const hasATwitterProfile = (author) =>
    !!authors[author].socialProfiles.twitter;

  const writers = author.split(", ");

  const renderTwitterHandles = () => {
    let result = writers.reduce(
      (acc, current) =>
        acc +
        (hasATwitterProfile(current) ? `@${current}` : authors[current].name) +
        ", ",
      ""
    );
    result = result.substring(0, result.length - 2);
    return result;
  };

  const socialLinks = [
    {
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${title} by ${renderTwitterHandles()} ${baseUrl}${slug}`
      )}`,
      alt: "Twitter",
      icon: "/svg/brands/twitter.svg",
      trackingName: "twitter",
    },
    {
      href: `http://www.reddit.com/submit?url=${encodeURIComponent(
        `${baseUrl}${slug}&title=${title}`
      )}`,
      alt: "Reddit",
      icon: "/svg/brands/reddit.svg",
      trackingName: "reddit",
    },
  ];
</script>

<svelte:head>
  <link rel="stylesheet" href="/prism-solarized-light.min.css" />
</svelte:head>

<OpenGraph
  data={{
    description: excerpt,
    title,
    type: "article",
    image: `images/${imagesDirectoryName}/${slug}/${image}`,
    imageTwitter: `images/${imagesDirectoryName}/${slug}/${image}`,
    norobots: norobots,
  }}
/>
<div class="post content-blog">
  <img
    src="/images/{imagesDirectoryName}/{slug}/{teaserImage || image}"
    alt={`${title}`}
    class="headerImage"
  />
  <p class="date">{dateDisplay}</p>
  <h1>{title}</h1>
  <p>
    <span
      ><Avatars
        usernames={author}
        displayNames={authorDisplayNames}
        socialMediaLinks={authorSocialMediaLinks}
        socialMediaLinkClasses="inline-flex mr-4 px-2 bg-white rounded-xl text-light-grey focus:bg-off-white focus:text-dark-grey hover:bg-off-white hover:text-dark-grey"
        socialMediaImgClasses="mr-2 h-6 w-6 place-self-center"
      /></span
    >
  </p>
  <div>
    <slot />
  </div>
  <section class="share">
    <h2 class="h4">Share this post:</h2>
    <ul>
      {#each socialLinks as link}
        <li>
          <a
            href={link.href}
            on:click={() =>
              window.analytics.track("content_share_clicked", {
                medium: link.trackingName,
              })}
            target="_blank"
          >
            <img src={link.icon} alt={link.alt} height="24" width="24" />
          </a>
        </li>
      {/each}
    </ul>
  </section>
</div>
