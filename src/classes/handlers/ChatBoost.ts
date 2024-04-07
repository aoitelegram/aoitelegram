import type { AoiClient } from "../AoiClient";

function onChatBoost(telegram: AoiClient) {
  const events = telegram.events.get("chatBoost");
  if (!events) return;

  for (const event of events) {
    telegram.on("chat_boost", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onChatBoost;
