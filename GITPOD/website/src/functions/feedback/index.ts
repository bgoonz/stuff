import type { Handler } from "@netlify/functions";
import { submitFeedback as submitExtensionFeedback } from "./_browser-extension";
import { submitFeedback as submitManualFeedback } from "./_manual";

const routeToHandler = (type: string) => {
  if (type === "docs" || type === "guides" || type === "digests") {
    return submitManualFeedback;
  } else if (type === "browser-extension") {
    return submitExtensionFeedback;
  }
  return () => {
    throw new Error("Pleae provide a feedback type.");
  };
};

const handler: Handler = (event, _, callback) => {
  console.log(JSON.stringify(event.body));
  const submitFeedback = routeToHandler(JSON.parse(event.body).type);

  submitFeedback(event.body)
    .then((response) => callback(null, response))
    .catch((error) => {
      console.error(error);
      callback(error, null);
    });
};

export { handler };
