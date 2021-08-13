import { writable } from "svelte/store";

// true: topics open
// false: topics closed
export default writable(false);
