import type { AoiClient } from "../AoiClient";

function onChatMember(telegram: AoiClient): void {
  const events = telegram.events.get("chatMember");
  if (!events) return;

  telegram.on("chat_member", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onChatMember;
