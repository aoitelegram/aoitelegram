import type { AoiClient } from "../AoiClient";

function onChatBoost(telegram: AoiClient): void {
  telegram.on("chat_boost", async (ctx) => {
    const events = telegram.events.get("chatBoost");
    if (!events) return;

    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onChatBoost;
