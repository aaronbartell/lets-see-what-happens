// PROTECTED FILE — see constitution/protected-paths.json
// BotID client instrumentation: protects the submission endpoint from bots.
import { initBotId } from "botid/client/core";

initBotId({
  protect: [{ path: "/api/submit", method: "POST" }],
});
