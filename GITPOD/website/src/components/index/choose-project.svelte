<script>
  import { onMount } from "svelte";
  import Section from "../section.svelte";

  let animatedTexts = {
    desktop: [
      {
        isVisible: false,
        text: "check dependencies, checkout branch, view",
      },
      {
        isVisible: false,
        text: "readme.txt, install tools, run build, run test,",
      },
    ],
    mobile: [
      {
        isVisible: false,
        text: "check dependencies,",
      },
      {
        isVisible: false,
        text: "checkout branch, view",
      },
      {
        isVisible: false,
        text: "readme.txt, install tools,",
      },
      {
        isVisible: false,
        text: "run build, run test,",
      },
    ],
  };

  /*
   * In order to trigger the animated text at the right time on both desktop and mobile,
   * we kick off the animation when the nav element starts to move out of the viewport
   * and the next section starts to enter the viewport. At that time, the animated Gitpod
   * benefits text is placed roughly at the center of the browser's viewport.
   */
  let isTopHidden = false;
  let isBottomShown = false;
  let hasAnimated = false;

  const startAnimation = () => {
    let t = 0;
    Object.entries(animatedTexts).forEach(([, texts]) =>
      texts.forEach((text) => {
        setTimeout(() => {
          text.isVisible = true;
          animatedTexts = animatedTexts; // This triggers Svelte's reactivity
        }, t);
        t = t + 400;
      })
    );
    hasAnimated = true;
  };

  const manageAnimation = () => {
    if (isTopHidden && isBottomShown && !hasAnimated) {
      startAnimation();
    }
  };

  onMount(() => {
    const callbackTop = (entries) => {
      entries.forEach((entry) => {
        isTopHidden = !entry.isIntersecting;
      });
      manageAnimation();
    };

    const callbackBottom = (entries) => {
      entries.forEach((entry) => {
        isBottomShown = entry.isIntersecting;
      });
      manageAnimation();
    };

    const observerTop = new IntersectionObserver(callbackTop, {
      threshold: [0.9],
    });
    const observerBottom = new IntersectionObserver(callbackBottom, {
      threshold: [0],
    });
    const targetTop = document.querySelector(
      "#choose-project-observer-target-top"
    );
    const targetBottom = document.querySelector(
      "#choose-project-observer-target-bottom"
    );
    observerTop.observe(targetTop);
    observerBottom.observe(targetBottom);

    return () => {
      observerTop.disconnect();
      observerBottom.disconnect();
    };
  });
</script>

<style lang="scss">
  .row {
    width: 100%;
  }

  h2 {
    text-align: center;
    max-width: 67.7rem;
    margin: 0 auto;

    @media (max-width: 1194px) {
      font-size: var(--h3);
    }

    @media (max-width: 682px) {
      max-width: 23.75rem;
    }

    @media (max-width: 382px) {
      font-size: 1.7rem;
      min-width: 292px;
    }
  }

  del {
    text-decoration: none;
  }

  .desktop {
    display: none;
  }

  @media (min-width: 683px) {
    .desktop {
      display: initial;
    }

    .mobile {
      display: none;
    }
  }

  span {
    transition: all 0.2s;
    display: inline-block;
    position: relative;
    color: inherit;
  }

  .strikethrough {
    transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
    color: var(--light-grey);
  }

  .strikethrough::after {
    content: "";
    position: absolute;
    display: block;
    width: 100%;
    height: 3px;
    margin-top: -0.6em;
    transform-origin: center left;
    animation: strikethrough 0.6s 0.4s cubic-bezier(0.55, 0, 0.1, 1) 1 forwards;
    transition: transform 0.4s cubic-bezier(0.55, 0, 0.1, 1);
  }

  @keyframes strikethrough {
    from {
      transform: scaleX(0);
      background: var(--light-grey);
    }
    to {
      transform: scaleX(1);
      background: var(--light-grey);
    }
  }
</style>

<div class="row">
  <Section>
    <h2 class="h1">
      Select project,
      <br />
      {#each Object.entries(animatedTexts) as [device, texts]}
        <del class={device}>
          {#each texts as { isVisible, text }}
            <span class:strikethrough={isVisible}>{text}</span>
          {/each}
        </del>
      {/each}
      <br />
      start coding.
    </h2>
  </Section>
</div>
