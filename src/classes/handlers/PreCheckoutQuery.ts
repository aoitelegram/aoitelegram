import type { AoiClient } from "../AoiClient";

function onPreCheckoutQuery(telegram: AoiClient): void {
  telegram.on("pre_checkout_query", async (ctx) => {
    const events = telegram.events.get("preCheckoutQuery");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onPreCheckoutQuery;
