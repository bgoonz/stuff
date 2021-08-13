import { auth } from "./auth";
import { getState } from "./get-state";
import { VERSION } from "./version";
export function createProbotAuth(options) {
    const state = getState(options);
    return Object.assign(auth.bind(null, state), {
        hook: state.auth.hook,
    });
}
createProbotAuth.VERSION = VERSION;
