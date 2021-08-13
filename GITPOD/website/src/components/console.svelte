<script lang="ts">
  import { onMount } from "svelte";

  export let source = "";
  export let dark = false;
  export let shadow: "grey" | "brand" | false = "grey";
  export let narrow = false;
  export let skipToEnd = false;
  export let alt = "";

  $: colors = dark
    ? {
        black: "#F9F9F9",
        orange: "#fc8800",
        green: "#57c700",
        blue: "#FFE4BC",
      }
    : {
        black: "rgba(18, 16, 12, 0.7)",
        orange: "#fc8800",
        green: "#57c700",
        blue: "#0099EF",
      };

  let wrapper: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  function debounce(fn, wait, callFirst) {
    var timeout;
    return function () {
      if (!wait) {
        return fn.apply(this, arguments);
      }
      var context = this;
      var args = arguments;
      var callNow = callFirst && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        timeout = null;
        if (!callNow) {
          return fn.apply(context, args);
        }
      }, wait);

      if (callNow) {
        return fn.apply(this, arguments);
      }
    };
  }

  onMount(() => {
    let font_size;
    let line_height;
    let margins;

    let c = canvas.getContext("2d");

    let width;
    let height;
    let char_width;
    let char_max;

    function resize() {
      width = wrapper.clientWidth;
      height = wrapper.clientHeight;

      let dpr = devicePixelRatio > 1 ? 2 : 1;

      canvas.width = dpr * width;
      canvas.height = dpr * height;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      c.scale(dpr, dpr);

      if (width < 500) {
        font_size = 12;
        line_height = 19;

        margins = {
          top: 52 + line_height,
          right: 10,
          bottom: 15,
          left: 15,
        };
      } else {
        font_size = narrow ? 16 : 18;
        line_height = narrow ? 28 : 33;

        margins = {
          top: 52 + line_height,
          right: narrow ? 20 : 40,
          bottom: narrow ? 20 : 48,
          left: narrow ? 20 : 40,
        };
      }

      c.font = `${font_size}px SF Mono, monospace`;
      c.fillStyle = colors.black;

      char_width = c.measureText(" ".repeat(64)).width / 64;
      char_max = Math.floor(
        (width - margins.left - margins.right) / char_width
      );
    }

    resize();

    function parse(source) {
      let color = colors.black;
      let lines = [];
      let line;
      let offset = 0;

      function new_line() {
        offset = 0;
        line = { input: [], output: [] };
        lines.push(line);
      }

      function parse_chunk(type, chunk) {
        chunk.replace(
          /(\u001b\[30m)|(\u001b\[31m)|(\u001b\[32m)|(\u001b\[33m)|(\u001b\[34m)|(\u001b\[39m)|([^\u001b]+)/g,
          (_, c_black, c_red, c_green, c_yellow, c_blue, c_default, str) => {
            if (c_black) color = colors.black;
            if (c_red) color = colors.orange;
            if (c_green) color = colors.green;
            if (c_yellow) color = colors.orange;
            if (c_blue) color = colors.blue;
            if (c_default) color = colors.black;

            if (str) {
              let start = 0;
              let end = Math.min(str.length, char_max - offset);
              let text;
              while ((text = str.slice(start, end))) {
                line[type].push({ type, color, text });
                offset += end - start;
                if (offset >= char_max && end < str.length) {
                  new_line();
                }
                start = end;
                end = Math.min(str.length, end + char_max - offset);
              }
            }
          }
        );
      }

      for (let str of source.split("\n")) {
        new_line();
        if (
          str.indexOf("$") !== -1 ||
          str.indexOf(">") !== -1 ||
          str.indexOf("#") !== -1
        ) {
          let [, prompt, text] = str.match(/([^$>#]+(?:[$>#]))(.*)/);
          parse_chunk("output", prompt);
          parse_chunk("input", text);
        } else {
          parse_chunk("output", str);
        }
      }

      function count_characters(runs) {
        return runs.reduce((acc, cur) => acc + cur.text.length, 0);
      }

      for (let line of lines) {
        line.input.characters = count_characters(line.input);
        line.output.characters = count_characters(line.output);
      }

      return lines;
    }

    let state;

    function init() {
      let lines = parse(source);

      if (skipToEnd) {
        state = {
          tick: -1,
          line: lines.length - 1,
          character: lines[lines.length - 1].input.characters - 1,
          lines: lines,
          triggers: {
            line: 0,
            character: -1,
          },
        };
      } else {
        state = {
          tick: -1,
          line: -1,
          character: -1,
          lines: lines,
          triggers: {
            line: 0,
            character: -1,
          },
        };
      }
    }

    init();

    function now(trigger) {
      return state.tick === trigger;
    }

    function random(min, max) {
      return Math.floor(min + (max - min) * Math.random());
    }

    function update() {
      state.tick += 1;

      if (now(state.triggers.line)) {
        if (state.line < state.lines.length - 1) {
          state.line += 1;
          state.character = 0;

          if (state.character < state.lines[state.line].input.characters - 1) {
            state.triggers.character = state.tick + random(2, 3);
          } else {
            state.triggers.line = state.tick + random(1, 2);
          }
        }
      }

      if (now(state.triggers.character)) {
        if (state.character < state.lines[state.line].input.characters - 1) {
          state.character += 1;
          state.triggers.character = state.tick + random(2, 3);
        } else {
          if (state.line < state.lines.length - 1) {
            if (state.lines[state.line + 1].output.characters) {
              state.triggers.line = state.tick + random(20, 30);
            } else {
              state.triggers.line = state.tick + random(2, 3);
            }
          }
        }
      }
    }

    function draw(time) {
      c.clearRect(0, 0, width, height);

      let scroll_y = 0;

      if (state.line * line_height + margins.top >= height - margins.bottom) {
        scroll_y =
          state.line * line_height - height + margins.top + margins.bottom;
      }

      for (let i = 0; i <= state.line; i++) {
        let offset = 0;

        for (let run of state.lines[i].output) {
          c.fillStyle = run.color;
          c.fillText(
            run.text,
            margins.left + offset * char_width,
            margins.top + line_height * i - scroll_y
          );
          offset += run.text.length;
        }

        let prompt_length = offset;

        for (let run of state.lines[i].input) {
          c.fillStyle = run.color;
          if (i === state.line) {
            let run_length = state.character - (offset - prompt_length) + 1;
            c.fillText(
              run.text.slice(0, run_length),
              margins.left + offset * char_width,
              margins.top + line_height * i - scroll_y
            );
            if (time % 1000 < 500) {
              c.fillRect(
                margins.left + (offset + run_length) * char_width + 0.5,
                margins.top + line_height * i - scroll_y - line_height * 0.575,
                char_width,
                line_height * 0.7
              );
            }
          } else {
            c.fillText(
              run.text,
              margins.left + offset * char_width,
              margins.top + line_height * i - scroll_y
            );
          }
          offset += run.text.length;
        }
      }
    }

    let handle_resize = debounce(
      () => {
        if (width === wrapper.clientWidth) {
          // iOS Safari gives us a resize event when the toolbar is hidden or shown.
          // We don't want to invalidate the layout then, as the width stays the same.
          return;
        }

        // If the width has changed, we invalidate the layout as the total number of lines may have changed.
        resize();
        init();
      },
      1000,
      false
    );

    window.addEventListener("resize", handle_resize);

    let mounted = true;
    let intersecting = false;

    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
    });

    observer.observe(wrapper);

    function render(time) {
      if (!mounted) {
        return;
      }

      requestAnimationFrame(render);

      if (!intersecting) {
        return;
      }

      update();
      draw(time);
    }

    requestAnimationFrame(render);

    return () => {
      mounted = false;
      window.removeEventListener("resize", handle_resize);
      observer.disconnect();
    };
  });
</script>

<style>
  .aspect {
    position: relative;
    height: 100%;
    max-height: 500px;
    min-height: 240px;
  }
  .aspect::before {
    content: "";
    display: block;
    padding-bottom: 125%;
  }
  .aspect.narrow::before {
    padding-bottom: 70%;
  }
  @media (min-width: 769px) {
    .aspect::before {
      padding-bottom: 80%;
    }
    .aspect.narrow::before {
      padding-bottom: 40%;
    }
  }
  .wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #f9f9f9;
    border-radius: 20px;
    transform: translate3d(0px, 0px, 0px);
  }
  .wrapper.dark {
    background: rgba(18, 16, 12, 0.7);
  }
  .wrapper.shadowGrey {
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.08),
      0px 5px 20px rgba(0, 0, 0, 0.12);
  }
  .wrapper.shadowBrand {
    box-shadow: var(--shadow-brand);
  }
  .titlebar {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 48px;
    background: rgba(249, 249, 249, 0.9);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
  .dark .titlebar {
    background: #696662;
  }
  .titlebar::before {
    content: "";
    display: block;
    width: 16px;
    height: 16px;
    position: absolute;
    top: 16px;
    left: 16px;
    border-radius: 8px;
    background: #e7e7e7;
  }
  .dark .titlebar::before {
    background: #807c78;
  }
  figcaption {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
</style>

<div class="aspect" class:narrow>
  <figure
    class="wrapper"
    class:dark
    class:shadowGrey={shadow === "grey"}
    class:shadowBrand={shadow === "brand"}
    bind:this={wrapper}
  >
    <div class="titlebar" />
    <canvas bind:this={canvas} />
    {#if alt}
      <figcaption>{alt}</figcaption>
    {/if}
  </figure>
</div>
