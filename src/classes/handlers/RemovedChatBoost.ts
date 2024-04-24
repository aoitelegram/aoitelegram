import type { AoiClient } from "../AoiClient";

function onRemovedChatBoost(telegram: AoiClient): void {
  const events = telegram.events.get("removedChatBoost");
  if (!events) return;

  telegram.on("removed_chat_boost", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onRemovedChatBoost;
