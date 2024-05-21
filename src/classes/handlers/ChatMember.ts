import type { AoiClient } from "../AoiClient";

function onChatMember(telegram: AoiClient): void {
  telegram.on("chat_member", async (ctx) => {
    const events = telegram.events.get("chatMember");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onChatMember;
