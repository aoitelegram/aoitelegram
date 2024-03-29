import type { AoiClient } from "../AoiClient";

function onChatMember(telegram: AoiClient) {
  const commands = telegram.commands.get("chatMember");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("chat_member", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onChatMember;
