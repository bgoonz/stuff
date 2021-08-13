export const isEurope = () => {
  const offset = new Date().getTimezoneOffset();
  return offset <= 0 && offset >= -180;
};

export const hyphenate = (str: string = "") =>
  str.toLocaleLowerCase().replace(/\s/g, "-");

export const showHideOverflowY = (bool: boolean) => {
  const html = document.querySelector("html");
  if (bool) {
    html.classList.add("overflow-y-hidden", "mr-4");
  } else {
    html.classList.remove("overflow-y-hidden", "mr-4");
  }
};
