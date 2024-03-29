import type { AoiClient } from "../AoiClient";

function onInlineQuery(telegram: AoiClient) {
  const commands = telegram.commands.get("inlineQuery");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("inline_query", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onInlineQuery;
