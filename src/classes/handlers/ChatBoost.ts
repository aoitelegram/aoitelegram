import type { AoiClient } from "../AoiClient";

function onChatBoost(telegram: AoiClient): void {
  const events = telegram.events.get("chatBoost");
  if (!events) return;

  telegram.on("chat_boost", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onChatBoost;
