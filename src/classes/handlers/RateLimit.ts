import type { AoiClient } from "../AoiClient";

function onRateLimit(telegram: AoiClient): void {
  telegram.on("rate_limit", async (ctx) => {
    const events = telegram.events.get("rateLimit");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onRateLimit;
