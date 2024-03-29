import type { AoiClient } from "../AoiClient";

function onMyChatMember(telegram: AoiClient) {
  const commands = telegram.commands.get("myChatMember");
  if (!commands) return;

  for (const command of commands) {
    telegram.on("my_chat_member", async (ctx) => {
      await telegram.evaluateCommand(command, ctx);
    });
  }
}

export default onMyChatMember;
