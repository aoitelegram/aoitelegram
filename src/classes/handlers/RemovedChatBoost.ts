import type { AoiClient } from "../AoiClient";

function onRemovedChatBoost(telegram: AoiClient): void {
  telegram.on("removed_chat_boost", async (ctx) => {
    const events = telegram.events.get("removedChatBoost");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onRemovedChatBoost;
