import type { AoiClient } from "../AoiClient";

function onShippingQuery(telegram: AoiClient) {
  const commands = telegram.commands.get("shippingQuery");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("shipping_query", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onShippingQuery;
