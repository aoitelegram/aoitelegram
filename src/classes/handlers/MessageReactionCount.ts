import type { AoiClient } from "../AoiClient";

function onMessageReactionCount(telegram: AoiClient): void {
  const events = telegram.events.get("messageReactionCount");
  if (!events) return;

  for (const event of events) {
    telegram.on("message_reaction_count", async (ctx) => {
      await telegram.evaluateCommand(event, ctx);
    });
  }
}

export default onMessageReactionCount;
