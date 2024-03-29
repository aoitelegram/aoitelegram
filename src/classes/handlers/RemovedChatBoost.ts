import type { AoiClient } from "../AoiClient";

function onRemovedChatBoost(telegram: AoiClient) {
  const commands = telegram.commands.get("removedChatBoost");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("removed_chat_boost", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onRemovedChatBoost;
