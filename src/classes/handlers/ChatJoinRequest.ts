import type { AoiClient } from "../AoiClient";

function onChatJoinRequest(telegram: AoiClient) {
  const commands = telegram.commands.get("chatJoinRequest");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("chat_join_request", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onChatJoinRequest;
