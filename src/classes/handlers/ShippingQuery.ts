import type { AoiClient } from "../AoiClient";

function onShippingQuery(telegram: AoiClient): void {
  const events = telegram.events.get("shippingQuery");
  if (!events) return;

  telegram.on("shipping_query", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onShippingQuery;
