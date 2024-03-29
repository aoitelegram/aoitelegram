import type { AoiClient } from "../AoiClient";

function onMessageReaction(telegram: AoiClient) {
  const commands = telegram.commands.get("messageReaction");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("message_reaction", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onMessageReaction;
