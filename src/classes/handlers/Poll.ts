import type { AoiClient } from "../AoiClient";

function onPoll(telegram: AoiClient) {
  const commands = telegram.commands.get("poll");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("poll", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onPoll;
