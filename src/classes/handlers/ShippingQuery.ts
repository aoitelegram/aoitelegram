import type { AoiClient } from "../AoiClient";

function onShippingQuery(telegram: AoiClient): void {
  telegram.on("shipping_query", async (ctx) => {
    const events = telegram.events.get("shippingQuery");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onShippingQuery;
