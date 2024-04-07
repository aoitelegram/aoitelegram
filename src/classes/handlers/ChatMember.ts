import type { AoiClient } from "../AoiClient";

function onChatMember(telegram: AoiClient) {
  const events = telegram.events.get("chatMember");
  if (!events) return;

  for (const event of events) {
    telegram.on("chat_member", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onChatMember;
