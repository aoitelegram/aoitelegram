import type { AoiClient } from "../AoiClient";

function onShippingQuery(telegram: AoiClient): void {
  const events = telegram.events.get("shippingQuery");
  if (!events) return;

  for (const event of events) {
    telegram.on("shipping_query", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onShippingQuery;
