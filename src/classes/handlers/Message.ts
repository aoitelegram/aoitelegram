import type { AoiClient } from "../AoiClient";

function onMessage(telegram: AoiClient) {
  const commands = telegram.commands.get("message");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("message", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onMessage;
