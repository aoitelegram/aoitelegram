import type { AoiClient } from "../AoiClient";

function onChatBoost(telegram: AoiClient) {
  const commands = telegram.commands.get("chatBoost");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("chat_boost", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onChatBoost;
