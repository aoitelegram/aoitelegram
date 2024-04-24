import type { AoiClient } from "../AoiClient";

function onMessageReactionCount(telegram: AoiClient): void {
  const events = telegram.events.get("messageReactionCount");
  if (!events) return;

  telegram.on("message_reaction_count", async (ctx) => {
    for (const event of events) {
      await telegram.evaluateCommand(event, ctx);
    }
  });
}

export default onMessageReactionCount;
