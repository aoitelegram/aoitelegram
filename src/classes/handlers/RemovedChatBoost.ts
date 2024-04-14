import type { AoiClient } from "../AoiClient";

function onRemovedChatBoost(telegram: AoiClient): void {
  const events = telegram.events.get("removedChatBoost");
  if (!events) return;

  for (const event of events) {
    telegram.on("removed_chat_boost", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onRemovedChatBoost;
