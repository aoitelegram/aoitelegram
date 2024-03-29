import type { AoiClient } from "../AoiClient";

function onCallbackQuery(telegram: AoiClient) {
  const commands = telegram.commands.get("callbackQuery");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("callback_query", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onCallbackQuery;
