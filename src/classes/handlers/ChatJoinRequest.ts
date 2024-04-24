import type { AoiClient } from "../AoiClient";

function onChatJoinRequest(telegram: AoiClient): void {
  const events = telegram.events.get("chatJoinRequest");
  if (!events) return;

  telegram.on("chat_join_request", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onChatJoinRequest;
