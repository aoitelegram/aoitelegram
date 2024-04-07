import type { AoiClient } from "../AoiClient";

function onPreCheckoutQuery(telegram: AoiClient) {
  const events = telegram.events.get("preCheckoutQuery");
  if (!events) return;

  for (const event of events) {
    telegram.on("pre_checkout_query", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onPreCheckoutQuery;
