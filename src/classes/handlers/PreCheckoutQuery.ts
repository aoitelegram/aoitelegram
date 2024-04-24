import type { AoiClient } from "../AoiClient";

function onPreCheckoutQuery(telegram: AoiClient): void {
  const events = telegram.events.get("preCheckoutQuery");
  if (!events) return;

  telegram.on("pre_checkout_query", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onPreCheckoutQuery;
