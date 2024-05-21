import type { AoiClient } from "../AoiClient";

function onChatJoinRequest(telegram: AoiClient): void {
  telegram.on("chat_join_request", async (ctx) => {
    const events = telegram.events.get("chatJoinRequest");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onChatJoinRequest;
