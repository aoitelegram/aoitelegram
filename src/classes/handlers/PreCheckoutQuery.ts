import type { AoiClient } from "../AoiClient";

function onPreCheckoutQuery(telegram: AoiClient) {
  const commands = telegram.commands.get("preCheckoutQuery");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("pre_checkout_query", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onPreCheckoutQuery;
